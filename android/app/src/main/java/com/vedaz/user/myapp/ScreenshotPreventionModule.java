package com.vedaz.user.myapp;

import android.view.WindowManager;
import android.view.Window;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ScreenshotPreventionModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public ScreenshotPreventionModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "ScreenshotPrevention";
    }

    @ReactMethod
    public void enable() {
        if (getCurrentActivity() != null) {
            getCurrentActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Window window = getCurrentActivity().getWindow();
                    if (window != null) {
                        window.addFlags(WindowManager.LayoutParams.FLAG_SECURE);
                    }
                }
            });
        }
    }

    @ReactMethod
    public void disable() {
        if (getCurrentActivity() != null) {
            getCurrentActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Window window = getCurrentActivity().getWindow();
                    if (window != null) {
                        window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
                    }
                }
            });
        }
    }
}