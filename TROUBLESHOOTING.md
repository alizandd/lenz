# Troubleshooting Guide - Lenz TV

## 🔍 Common Issues and Solutions

### 1. Video Not Playing

#### Symptom
Black screen or spinning loader without video content

#### Possible Causes & Solutions

**A. Invalid HLS Stream URL**
```bash
# Test the stream URL directly
curl -I "http://stream-url.m3u8"
```
✅ Solution: Verify the API returns valid HLS URLs

**B. Network Connectivity**
```bash
# Check device internet connection
adb shell ping -c 4 google.com
```
✅ Solution: Ensure device has active internet connection

**C. CORS or Network Security**
- Check if AndroidManifest.xml has `usesCleartextTraffic="true"` for HTTP streams
- For HTTPS streams, ensure valid SSL certificates

✅ Solution: Update AndroidManifest.xml:
```xml
<application
    android:usesCleartextTraffic="true"
    ...>
```

**D. Video Format Issues**
- Ensure streams are HLS format (.m3u8)
- Check codec compatibility (H.264 recommended)

✅ Solution: Verify stream format with media player like VLC

---

### 2. TV Remote Not Responding

#### Symptom
D-pad navigation doesn't move between channels

#### Possible Causes & Solutions

**A. TV Features Not Enabled**
✅ Solution: Check `AndroidManifest.xml` contains:
```xml
<uses-feature
    android:name="android.software.leanback"
    android:required="false" />
```

**B. Focus Not Set**
✅ Solution: Verify first channel has `hasTVPreferredFocus={true}`

**C. TVEventHandler Not Initialized**
✅ Solution: Check `src/components/ChannelList.js` initializes TVEventHandler

**D. Running on Non-TV Device**
✅ Solution: Test on Android TV emulator or physical TV device

---

### 3. App Not Appearing in TV Launcher

#### Symptom
Can't find app in Android TV home screen

#### Solution
Check `AndroidManifest.xml` contains:
```xml
<intent-filter>
    <action android:name="android.intent.action.MAIN" />
    <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
</intent-filter>
```

Then rebuild:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

---

### 4. Build Failures

#### Error: "Task :app:installDebug FAILED"

**A. Device Not Connected**
```bash
adb devices
```
✅ Solution: Connect device and enable USB debugging

**B. Port Already in Use**
```bash
# Kill existing Metro process
npx react-native start --reset-cache
```

**C. Gradle Daemon Issues**
```bash
cd android
./gradlew --stop
./gradlew clean
cd ..
```

#### Error: "Unable to load script"

✅ Solution:
```bash
npm start -- --reset-cache
# In another terminal
npm run android
```

#### Error: "Module not found: react-native-video"

✅ Solution:
```bash
npm install
cd android
./gradlew clean
cd ..
npm run android
```

---

### 5. Channel List Not Displaying

#### Symptom
Video plays but no channel list at bottom

#### Possible Causes & Solutions

**A. API Response Empty**
✅ Solution: Check API endpoint in browser:
```
https://hamsam.tvapps.ir/api/v1/lives
```

**B. Network Request Failed**
✅ Solution: Add internet permission to AndroidManifest.xml:
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

**C. Console Errors**
✅ Solution: Check React Native debugger:
```bash
adb logcat *:S ReactNative:V ReactNativeJS:V
```

---

### 6. App Crashes on Launch

#### Check Crash Logs
```bash
adb logcat | grep -i "crash\|exception\|error"
```

#### Common Crash Causes

**A. Native Module Not Linked**
✅ Solution:
```bash
cd android
./gradlew clean
cd ..
npm install
npm run android
```

**B. JavaScript Bundle Error**
✅ Solution:
```bash
npm start -- --reset-cache
```

**C. Memory Issues**
✅ Solution: Reduce video buffer settings in `VideoPlayer.js`

---

### 7. Fade Transition Not Working

#### Symptom
Channels switch instantly without fade effect

#### Solution
Check `VideoPlayer.js` has:
```javascript
useNativeDriver: true
```

If still not working:
```javascript
// Try without native driver
useNativeDriver: false
```

---

### 8. Persian Text Not Displaying Correctly

#### Symptom
Persian characters appear as boxes or reversed

#### Solutions

**A. Font Support**
✅ Add custom Persian font to `android/app/src/main/assets/fonts/`

**B. RTL Layout**
```javascript
// Add to App.js
import { I18nManager } from 'react-native';
I18nManager.forceRTL(true);
```

---

### 9. Performance Issues / Lag

#### Symptoms
- Slow channel navigation
- Choppy video playback
- UI freezes

#### Solutions

**A. Enable Hermes Engine**
In `android/gradle.properties`:
```properties
hermesEnabled=true
```

**B. Reduce Video Buffer**
In `src/components/VideoPlayer.js`:
```javascript
bufferConfig={{
  minBufferMs: 10000,
  maxBufferMs: 30000,
}}
```

**C. Optimize Images**
- Reduce channel icon sizes
- Use WebP format
- Implement image caching

---

### 10. Development Environment Issues

#### Metro Bundler Port Conflict
```bash
npx react-native start --port 8088
# In another terminal
npx react-native run-android --port 8088
```

#### Watchman Issues
```bash
watchman watch-del-all
```

#### NPM/Yarn Lock Issues
```bash
rm -rf node_modules
rm package-lock.json  # or yarn.lock
npm install
```

#### Android Studio Sync Failed
1. Open `android/` folder in Android Studio
2. File → Invalidate Caches / Restart
3. Tools → Android → Sync Project with Gradle Files

---

## 🐛 Debugging Tools

### React Native Debugger
```bash
# Open dev menu on device
adb shell input keyevent 82

# Or shake gesture on emulator
```

### Enable Remote Debugging
1. Open dev menu (Cmd+M / Ctrl+M)
2. Select "Debug"
3. Open Chrome DevTools

### View Logs
```bash
# All logs
adb logcat

# React Native only
adb logcat *:S ReactNative:V ReactNativeJS:V

# Error logs only
adb logcat *:E
```

### Network Inspection
```bash
# Install Reactotron
npm install --save-dev reactotron-react-native
```

---

## 📊 Performance Profiling

### Enable Performance Monitor
1. Open dev menu (Cmd+M / Ctrl+M)
2. Select "Perf Monitor"
3. Monitor FPS and memory usage

### Android Studio Profiler
1. Open Android Studio
2. View → Tool Windows → Profiler
3. Select running app
4. Monitor CPU, Memory, Network

---

## 🔧 Clean Build Process

When all else fails, try a complete clean build:

```bash
# 1. Stop all processes
pkill -f metro
pkill -f node

# 2. Clean JavaScript
rm -rf node_modules
rm package-lock.json
npm install

# 3. Clean Android
cd android
./gradlew clean
./gradlew --stop
cd ..

# 4. Clean Metro cache
npm start -- --reset-cache

# 5. Reinstall app (in new terminal)
adb uninstall com.lenz
npm run android
```

---

## 📞 Getting Help

### Check Logs First
Always check logs before asking for help:
```bash
adb logcat *:S ReactNative:V ReactNativeJS:V > debug.log
```

### Useful Resources
- React Native Docs: https://reactnative.dev
- React Native Video: https://github.com/react-native-video/react-native-video
- Stack Overflow: Tag `react-native`
- React Native Community: https://www.reactnative.dev/help

### Providing Bug Reports
Include:
1. Error message / crash log
2. Device/emulator information
3. React Native version
4. Steps to reproduce
5. Expected vs actual behavior

---

## ✅ Verification Checklist

After fixing issues, verify:

- [ ] App installs successfully
- [ ] App appears in TV launcher (for TV builds)
- [ ] Video plays without errors
- [ ] Channel list displays with icons
- [ ] Touch/click navigation works
- [ ] TV remote navigation works (D-pad)
- [ ] Channel switching is smooth
- [ ] Fade transitions work
- [ ] No console errors
- [ ] No memory leaks
- [ ] App doesn't crash on device rotation
- [ ] Network errors handled gracefully

---

**Still Having Issues?**

Review the main README.md and ARCHITECTURE.md for detailed documentation about the application structure and implementation details.





