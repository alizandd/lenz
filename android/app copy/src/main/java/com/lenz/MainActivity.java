package com.lenz;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.view.KeyEvent;

/**
 * MainActivity for the Lenz TV application
 * Supports both Android TV and mobile platforms
 */
public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Lenz";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled());
  }

  /**
   * Intercept Android key events and forward them to React Native (JS)
   */
  @Override
  public boolean onKeyDown(int keyCode, KeyEvent event) {
    ReactContext reactContext =
        getReactNativeHost().getReactInstanceManager().getCurrentReactContext();

    if (reactContext != null) {
      WritableMap params = Arguments.createMap();
      params.putInt("keyCode", keyCode);
      params.putInt("action", event.getAction());
      params.putInt("repeatCount", event.getRepeatCount());
      params.putString("eventType", "keyDown");

      reactContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
          .emit("AndroidKeyEvent", params);
    }

    // For D-pad navigation keys, we handle them entirely in JS
    if (keyCode == KeyEvent.KEYCODE_DPAD_UP ||
        keyCode == KeyEvent.KEYCODE_DPAD_DOWN ||
        keyCode == KeyEvent.KEYCODE_DPAD_LEFT ||
        keyCode == KeyEvent.KEYCODE_DPAD_RIGHT) {
      return true;
    }

    // For other keys, fall back to default behavior
    return super.onKeyDown(keyCode, event);
  }
}



