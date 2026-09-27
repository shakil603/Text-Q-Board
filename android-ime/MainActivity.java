package com.textqboard.app;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.view.inputmethod.InputMethodInfo;
import android.view.inputmethod.InputMethodManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

import java.util.List;

public class MainActivity extends BridgeActivity {

    private static final String PREFS_NAME = "TextQBoardPrefs";
    private static final String KEY_SETTINGS = "keyboard_settings";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.getSettings().setDomStorageEnabled(true);
            webView.addJavascriptInterface(new NativeSetupBridge(this), "AndroidNative");
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

    public class NativeSetupBridge {
        private final Context context;
        private final Handler mainHandler = new Handler(Looper.getMainLooper());

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
