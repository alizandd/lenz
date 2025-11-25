package com.lenz;

import android.app.Activity;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ExitModule extends ReactContextBaseJavaModule {

    public ExitModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ExitModule";
    }

    @ReactMethod
    public void exitApp() {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            activity.finishAndRemoveTask();
        }
    }
}
