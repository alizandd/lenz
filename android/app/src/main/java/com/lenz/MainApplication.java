package com.lenz;

import android.app.Application;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.brentvatne.react.ReactVideoPackage;
import com.horcrux.svg.SvgPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import java.util.ArrayList;
import java.util.List;

/**
 * MainApplication for the Lenz TV application
 */
public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      List<ReactPackage> packages = new ArrayList<>();
      packages.add(new MainReactPackage());
      packages.add(new ReactVideoPackage());
      packages.add(new SvgPackage());
      packages.add(new RNCWebViewPackage());
      packages.add(new ExitPackage());
      return packages;
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  }
}
