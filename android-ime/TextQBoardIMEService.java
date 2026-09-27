package com.textqboard.app;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.inputmethodservice.InputMethodService;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.util.DisplayMetrics;
import android.view.HapticFeedbackConstants;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputConnection;
import android.view.inputmethod.InputMethodManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import androidx.core.content.ContextCompat;
import androidx.webkit.WebViewAssetLoader;

import org.json.JSONObject;

import java.util.ArrayList;

public class TextQBoardIMEService extends InputMethodService {

    private static final String PREFS_NAME = "TextQBoardPrefs";
    private static final String KEY_SETTINGS = "keyboard_settings";

    private FrameLayout rootContainer;
    private WebView imeWebView;
    private SpeechRecognizer speechRecognizer;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private int currentHeightDp = 290;

    @Override
    public boolean onEvaluateFullscreenMode() {
        return false;
    }

    @Override
    public View onCreateInputView() {
        rootContainer = new FrameLayout(this);
        rootContainer.setBackgroundColor(0xFF1B1B1F);
        rootContainer.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));

        rootContainer.setOnApplyWindowInsetsListener((v, insets) -> {
            int bottomInset = insets.getSystemWindowInsetBottom();
            v.setPadding(0, 0, 0, Math.max(0, bottomInset));
            return insets;
        });

        imeWebView = new WebView(this);
        imeWebView.setBackgroundColor(0xFF1B1B1F);
        imeWebView.setVerticalScrollBarEnabled(false);
        imeWebView.setHorizontalScrollBarEnabled(false);
        imeWebView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        imeWebView.setFocusable(false);
        imeWebView.setFocusableInTouchMode(false);

        WebSettings webSettings = imeWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
            .setDomain("localhost")
            .addPathHandler("/", new WebViewAssetLoader.AssetsPathHandler(this))
            .build();

        imeWebView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if (url != null && "localhost".equals(url.getHost())) {
                    String path = url.getPath();
                    if (path == null || path.isEmpty() || "/".equals(path)) {
                        url = Uri.parse("https://localhost/public/index.html");
                    } else if (!path.startsWith("/public/")) {
                        url = Uri.parse("https://localhost/public" + path);
                    }
                }
                return assetLoader.shouldInterceptRequest(url);
            }
        });

        imeWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                mainHandler.post(() -> {
                    try {
                        request.grant(request.getResources());
                    } catch (Exception ignored) {
                    }
                });
            }
        });

        imeWebView.addJavascriptInterface(new ImeJavascriptBridge(), "AndroidIME");

        FrameLayout.LayoutParams webParams = new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            dpToPx(currentHeightDp)
        );
        rootContainer.addView(imeWebView, webParams);

        imeWebView.loadUrl("https://localhost/index.html?mode=ime");

        return rootContainer;
    }

    @Override
    public void onStartInputView(EditorInfo info, boolean restarting) {
        super.onStartInputView(info, restarting);
        if (imeWebView != null) {
            final int inputType = info != null ? info.inputType : 0;
            final int imeOptions = info != null ? info.imeOptions : 0;
            imeWebView.post(() -> {
                imeWebView.evaluateJavascript(
                    "if(window.onAndroidImeStart){window.onAndroidImeStart(" + inputType + "," + imeOptions + ");}",
                    null
                );
            });
        }
    }

    @Override
    public void onDestroy() {
        if (speechRecognizer != null) {
            try {
                speechRecognizer.destroy();
            } catch (Exception ignored) {
            }
            speechRecognizer = null;
        }
        super.onDestroy();
    }

    private int dpToPx(int dp) {
        DisplayMetrics metrics = getResources().getDisplayMetrics();
        return Math.round(dp * metrics.density);
    }

    private void dispatchVoiceEvent(String type, String payload) {
        if (imeWebView != null) {
            final String safeType = JSONObject.quote(type != null ? type : "");
            final String safePayload = JSONObject.quote(payload != null ? payload : "");
            imeWebView.post(() -> {
                imeWebView.evaluateJavascript(
                    "if(window.dispatchNativeVoiceEvent){window.dispatchNativeVoiceEvent(" + safeType + "," + safePayload + ");}",
                    null
                );
            });
        }
    }

    private void startInternalVoiceRecognition(String lang) {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED) {
            // Launch MainActivity to request RECORD_AUDIO permission from Android OS
            try {
                Intent permIntent = new Intent(TextQBoardIMEService.this, MainActivity.class);
                permIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                permIntent.putExtra("REQUEST_MIC_PERMISSION", true);
                startActivity(permIntent);
                dispatchVoiceEvent("permission_requested", "Please allow microphone permission in the popup.");
            } catch (Exception e) {
                dispatchVoiceEvent("error", "Please grant Microphone permission to Text Q Board in Android Settings.");
            }
            return;
        }

        final String locale = (lang != null && !lang.isEmpty()) ? lang : "en-US";

        try {
            if (speechRecognizer != null) {
                try {
                    speechRecognizer.destroy();
                } catch (Exception ignored) {
                }
            }
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
            speechRecognizer.setRecognitionListener(new RecognitionListener() {
                @Override
                public void onReadyForSpeech(Bundle params) {
                    dispatchVoiceEvent("listening", "");
                }

                @Override
                public void onBeginningOfSpeech() {
                    dispatchVoiceEvent("listening", "");
                }

                @Override
                public void onRmsChanged(float rmsdB) {
                    dispatchVoiceEvent("rms", String.valueOf(rmsdB));
                }

                @Override
                public void onBufferReceived(byte[] buffer) {}

                @Override
                public void onEndOfSpeech() {
                    dispatchVoiceEvent("end", "");
                }

                @Override
                public void onError(int error) {
                    String msg = "Tap microphone to speak again";
                    if (error == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS) {
                        msg = "Microphone permission is required.";
                    } else if (error == SpeechRecognizer.ERROR_NO_MATCH) {
                        msg = "Didn't catch that. Tap mic to try again.";
                    } else if (error == SpeechRecognizer.ERROR_NETWORK || error == SpeechRecognizer.ERROR_NETWORK_TIMEOUT) {
                        msg = "Network error during voice recognition.";
                    }
                    dispatchVoiceEvent("error", msg);
                }

                @Override
                public void onResults(Bundle results) {
                    ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    if (matches != null && !matches.isEmpty()) {
                        dispatchVoiceEvent("final", matches.get(0));
                    } else {
                        dispatchVoiceEvent("end", "");
                    }
                }

                @Override
                public void onPartialResults(Bundle partialResults) {
                    ArrayList<String> partial = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    if (partial != null && !partial.isEmpty()) {
                        dispatchVoiceEvent("partial", partial.get(0));
                    }
                }

                @Override
                public void onEvent(int eventType, Bundle params) {}
            });

            Intent recognizerIntent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            recognizerIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            recognizerIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, locale);
            recognizerIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, locale);
            recognizerIntent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
            recognizerIntent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
            recognizerIntent.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getPackageName());

            speechRecognizer.startListening(recognizerIntent);
            dispatchVoiceEvent("listening", "");
        } catch (Exception e) {
            dispatchVoiceEvent("error", "Voice recognition unavailable: " + e.getMessage());
        }
    }

    public class ImeJavascriptBridge {

        @JavascriptInterface
        public void commitText(String text) {
            if (text == null) return;
            mainHandler.post(() -> {
                InputConnection ic = getCurrentInputConnection();
                if (ic != null) {
                    ic.commitText(text, 1);
                }
            });
        }

        @JavascriptInterface
        public void deleteText(int count) {
            mainHandler.post(() -> {
                InputConnection ic = getCurrentInputConnection();
                if (ic != null) {
                    CharSequence selected = ic.getSelectedText(0);
                    if (selected != null && selected.length() > 0) {
                        ic.commitText("", 1);
                    } else {
                        ic.deleteSurroundingText(Math.max(1, count), 0);
                    }
                }
            });
        }

        @JavascriptInterface
        public void replaceCurrentWord(int deleteCount, String newText) {
            mainHandler.post(() -> {
                InputConnection ic = getCurrentInputConnection();
                if (ic != null) {
                    ic.beginBatchEdit();
                    if (deleteCount > 0) {
                        ic.deleteSurroundingText(deleteCount, 0);
                    }
                    if (newText != null) {
                        ic.commitText(newText, 1);
                    }
                    ic.endBatchEdit();
                }
            });
        }

        @JavascriptInterface
        public String getTextBeforeCursor(int maxChars) {
            try {
                InputConnection ic = getCurrentInputConnection();
                if (ic != null) {
                    CharSequence seq = ic.getTextBeforeCursor(Math.max(1, maxChars), 0);
                    return seq != null ? seq.toString() : "";
                }
            } catch (Exception ignored) {
            }
            return "";
        }

        @JavascriptInterface
        public void sendEnter() {
            mainHandler.post(() -> {
                InputConnection ic = getCurrentInputConnection();
                EditorInfo ei = getCurrentInputEditorInfo();
                if (ic != null) {
                    if (ei != null) {
                        int action = ei.imeOptions & EditorInfo.IME_MASK_ACTION;
                        boolean noEnterAction = (ei.imeOptions & EditorInfo.IME_FLAG_NO_ENTER_ACTION) != 0;
                        if (!noEnterAction && (action == EditorInfo.IME_ACTION_SEARCH
                                || action == EditorInfo.IME_ACTION_SEND
                                || action == EditorInfo.IME_ACTION_GO
                                || action == EditorInfo.IME_ACTION_NEXT
                                || action == EditorInfo.IME_ACTION_DONE)) {
                            ic.performEditorAction(action);
                            return;
                        }
                    }
                    ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_ENTER));
                    ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_ENTER));
                }
            });
        }

        @JavascriptInterface
        public void moveCursor(String direction) {
            mainHandler.post(() -> {
                InputConnection ic = getCurrentInputConnection();
                if (ic == null) return;
                int keyCode = KeyEvent.KEYCODE_DPAD_RIGHT;
                if ("left".equals(direction)) keyCode = KeyEvent.KEYCODE_DPAD_LEFT;
                else if ("right".equals(direction)) keyCode = KeyEvent.KEYCODE_DPAD_RIGHT;
                else if ("up".equals(direction)) keyCode = KeyEvent.KEYCODE_DPAD_UP;
                else if ("down".equals(direction)) keyCode = KeyEvent.KEYCODE_DPAD_DOWN;
                else if ("start".equals(direction)) keyCode = KeyEvent.KEYCODE_MOVE_HOME;
                else if ("end".equals(direction)) keyCode = KeyEvent.KEYCODE_MOVE_END;
                ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, keyCode));
                ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_UP, keyCode));
            });
        }

        @JavascriptInterface
        public void performContextMenuAction(String action) {
            mainHandler.post(() -> {
                InputConnection ic = getCurrentInputConnection();
                if (ic == null) return;
                if ("selectAll".equals(action)) ic.performContextMenuAction(android.R.id.selectAll);
                else if ("copy".equals(action)) ic.performContextMenuAction(android.R.id.copy);
                else if ("cut".equals(action)) ic.performContextMenuAction(android.R.id.cut);
                else if ("paste".equals(action)) ic.performContextMenuAction(android.R.id.paste);
            });
        }

        @JavascriptInterface
        public void vibrate(int durationMs) {
            mainHandler.post(() -> {
                try {
                    if (imeWebView != null) {
                        imeWebView.performHapticFeedback(
                            HapticFeedbackConstants.KEYBOARD_TAP,
                            HapticFeedbackConstants.FLAG_IGNORE_VIEW_SETTING
                        );
                    }
                    Vibrator vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                    if (vibrator != null && vibrator.hasVibrator()) {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            vibrator.vibrate(VibrationEffect.createOneShot(
                                Math.max(5, Math.min(50, durationMs)),
                                VibrationEffect.DEFAULT_AMPLITUDE
                            ));
                        } else {
                            vibrator.vibrate(Math.max(5, Math.min(50, durationMs)));
                        }
                    }
                } catch (Exception ignored) {
                }
            });
        }

        @JavascriptInterface
        public void playKeySound() {
            mainHandler.post(() -> {
                try {
                    AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
                    if (am != null) {
                        am.playSoundEffect(AudioManager.FX_KEYPRESS_STANDARD, -1f);
                    }
                } catch (Exception ignored) {
                }
            });
        }

        @JavascriptInterface
        public boolean hasMicPermission() {
            return ContextCompat.checkSelfPermission(TextQBoardIMEService.this, Manifest.permission.RECORD_AUDIO)
                    == PackageManager.PERMISSION_GRANTED;
        }

        @JavascriptInterface
        public void requestMicPermission() {
            mainHandler.post(() -> {
                try {
                    Intent permIntent = new Intent(TextQBoardIMEService.this, MainActivity.class);
                    permIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    permIntent.putExtra("REQUEST_MIC_PERMISSION", true);
                    startActivity(permIntent);
                } catch (Exception ignored) {
                }
            });
        }

        @JavascriptInterface
        public void startVoiceListening(String lang) {
            mainHandler.post(() -> startInternalVoiceRecognition(lang));
        }

        @JavascriptInterface
        public void stopVoiceListening() {
            mainHandler.post(() -> {
                if (speechRecognizer != null) {
                    try {
                        speechRecognizer.stopListening();
                    } catch (Exception ignored) {
                    }
                }
            });
        }

        @JavascriptInterface
        public void switchInputMethod() {
            mainHandler.post(() -> {
                try {
                    InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
                    if (imm != null) {
                        imm.showInputMethodPicker();
                    }
                } catch (Exception ignored) {
                }
            });
        }

        @JavascriptInterface
        public void hideKeyboard() {
            mainHandler.post(() -> {
                try {
                    requestHideSelf(0);
                } catch (Exception ignored) {
                }
            });
        }

        @JavascriptInterface
        public void openSettings() {
            mainHandler.post(() -> {
                try {
                    Intent intent = new Intent(TextQBoardIMEService.this, MainActivity.class);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    startActivity(intent);
                    requestHideSelf(0);
                } catch (Exception ignored) {
                }
            });
        }

        @JavascriptInterface
        public void setKeyboardHeight(int heightDp) {
            final int clampedDp = Math.max(220, Math.min(420, heightDp));
            if (clampedDp == currentHeightDp) return;
            currentHeightDp = clampedDp;
            mainHandler.post(() -> {
                if (imeWebView != null) {
                    ViewGroup.LayoutParams lp = imeWebView.getLayoutParams();
                    if (lp != null) {
                        lp.height = dpToPx(clampedDp);
                        imeWebView.setLayoutParams(lp);
                        imeWebView.requestLayout();
                    }
                }
            });
        }

        @JavascriptInterface
        public String getSettingsJson() {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            return prefs.getString(KEY_SETTINGS, "");
        }

        @JavascriptInterface
        public void saveSettingsJson(String json) {
            if (json == null) return;
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().putString(KEY_SETTINGS, json).apply();
        }
    }
}
