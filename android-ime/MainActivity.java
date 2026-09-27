package com.textqboard.app;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.view.inputmethod.InputMethodInfo;
import android.view.inputmethod.InputMethodManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {

    private static final String PREFS_NAME = "TextQBoardPrefs";
    private static final String KEY_SETTINGS = "keyboard_settings";
    private static final int REQ_RECORD_AUDIO = 1001;
    private static final int REQ_VOICE_INTENT = 1002;

    private SpeechRecognizer speechRecognizer;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.getSettings().setDomStorageEnabled(true);
            webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
            webView.addJavascriptInterface(new NativeSetupBridge(this), "AndroidNative");

            webView.setWebChromeClient(new WebChromeClient() {
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
        }

        handleIncomingIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIncomingIntent(intent);
    }

    private void handleIncomingIntent(Intent intent) {
        if (intent != null && intent.getBooleanExtra("REQUEST_MIC_PERMISSION", false)) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                    this,
                    new String[]{Manifest.permission.RECORD_AUDIO},
                    REQ_RECORD_AUDIO
                );
            }
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_RECORD_AUDIO) {
            boolean granted = grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED;
            dispatchVoiceEvent(granted ? "permission_granted" : "error",
                granted ? "" : "Microphone permission was denied. Please allow microphone access in Settings.");
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_VOICE_INTENT) {
            if (resultCode == Activity.RESULT_OK && data != null) {
                ArrayList<String> matches = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                if (matches != null && !matches.isEmpty()) {
                    dispatchVoiceEvent("final", matches.get(0));
                } else {
                    dispatchVoiceEvent("end", "");
                }
            } else {
                dispatchVoiceEvent("end", "");
            }
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        notifyImeStatusChanged();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            notifyImeStatusChanged();
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

    private void notifyImeStatusChanged() {
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().post(() -> {
                getBridge().getWebView().evaluateJavascript(
                    "window.dispatchEvent(new Event('imeStatusChanged'));",
                    null
                );
            });
        }
    }

    private void dispatchVoiceEvent(String type, String payload) {
        if (getBridge() != null && getBridge().getWebView() != null) {
            final String safeType = JSONObject.quote(type != null ? type : "");
            final String safePayload = JSONObject.quote(payload != null ? payload : "");
            getBridge().getWebView().post(() -> {
                getBridge().getWebView().evaluateJavascript(
                    "if(window.dispatchNativeVoiceEvent){window.dispatchNativeVoiceEvent(" + safeType + "," + safePayload + ");}",
                    null
                );
            });
        }
    }

    private void startInternalVoiceRecognition(String lang) {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                this,
                new String[]{Manifest.permission.RECORD_AUDIO},
                REQ_RECORD_AUDIO
            );
            dispatchVoiceEvent("permission_requested", "Please allow microphone access.");
            return;
        }

        final String locale = (lang != null && !lang.isEmpty()) ? lang : "en-US";

        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            // Fallback to system voice recognizer activity
            try {
                Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, locale);
                startActivityForResult(intent, REQ_VOICE_INTENT);
                dispatchVoiceEvent("listening", "");
            } catch (Exception e) {
                dispatchVoiceEvent("error", "Speech recognition service is not installed on this device.");
            }
            return;
        }

        try {
            if (speechRecognizer != null) {
                speechRecognizer.destroy();
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
                    String msg = "Tap microphone to try again";
                    if (error == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS) {
                        msg = "Microphone permission is required.";
                    } else if (error == SpeechRecognizer.ERROR_NO_MATCH) {
                        msg = "No speech detected. Tap mic to speak again.";
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
            dispatchVoiceEvent("error", "Could not start microphone: " + e.getMessage());
        }
    }

    public class NativeSetupBridge {
        private final Context context;

        public NativeSetupBridge(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public boolean isImeEnabled() {
            try {
                InputMethodManager imm = (InputMethodManager) context.getSystemService(Context.INPUT_METHOD_SERVICE);
                if (imm == null) return false;
                List<InputMethodInfo> list = imm.getEnabledInputMethodList();
                String pkg = context.getPackageName();
                for (InputMethodInfo info : list) {
                    if (pkg.equals(info.getPackageName())) {
                        return true;
                    }
                }
            } catch (Exception ignored) {
            }
            return false;
        }

        @JavascriptInterface
        public boolean isImeSelected() {
            try {
                String defaultIme = Settings.Secure.getString(
                    context.getContentResolver(),
                    Settings.Secure.DEFAULT_INPUT_METHOD
                );
                if (defaultIme != null && defaultIme.startsWith(context.getPackageName() + "/")) {
                    return true;
                }
            } catch (Exception ignored) {
            }
            return false;
        }

        @JavascriptInterface
        public void openInputMethodSettings() {
            mainHandler.post(() -> {
                try {
                    Intent intent = new Intent(Settings.ACTION_INPUT_METHOD_SETTINGS);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(intent);
                } catch (Exception ignored) {
                }
            });
        }

        @JavascriptInterface
        public void showInputMethodPicker() {
            mainHandler.postDelayed(() -> {
                try {
                    InputMethodManager imm = (InputMethodManager) context.getSystemService(Context.INPUT_METHOD_SERVICE);
                    if (imm != null) {
                        imm.showInputMethodPicker();
                    }
                } catch (Exception ignored) {
                }
            }, 150);
        }

        @JavascriptInterface
        public boolean hasMicPermission() {
            return ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO)
                    == PackageManager.PERMISSION_GRANTED;
        }

        @JavascriptInterface
        public void requestMicPermission() {
            mainHandler.post(() -> {
                ActivityCompat.requestPermissions(
                    MainActivity.this,
                    new String[]{Manifest.permission.RECORD_AUDIO},
                    REQ_RECORD_AUDIO
                );
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
        public String getSettingsJson() {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            return prefs.getString(KEY_SETTINGS, "");
        }

        @JavascriptInterface
        public void saveSettingsJson(String json) {
            if (json == null) return;
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().putString(KEY_SETTINGS, json).apply();
        }
    }
}
