# Quick Start Guide - Lenz TV

Get your Lenz TV application up and running in minutes!

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Metro Bundler

Open a terminal and run:

```bash
npm start
```

Keep this terminal running.

### Step 3: Run the Application

Open a **new** terminal and run:

```bash
npm run android
```

That's it! The app should now be running on your Android device or emulator.

## 📱 Device Setup

### For Android TV:

1. **Enable Developer Options**:
   - Go to Settings → About → Build number (click 7 times)
   
2. **Enable USB Debugging**:
   - Go to Settings → Developer Options → USB Debugging (enable)
   
3. **Connect via USB or WiFi**:
   - USB: Connect device and allow debugging
   - WiFi: `adb connect <TV_IP_ADDRESS>:5555`

4. **Verify Connection**:
   ```bash
   adb devices
   ```

### For Android TV Emulator:

1. Open Android Studio
2. AVD Manager → Create Virtual Device
3. Select TV category → Choose a TV device
4. Select system image (API 29+ recommended)
5. Click Finish and start the emulator

## 🎮 Testing TV Remote

### Physical Remote:
- Use D-pad arrows to navigate
- Use Select/Enter to choose a channel

### Emulator Remote:
- Press `Ctrl + M` (Windows/Linux) or `Cmd + M` (Mac) to open dev menu
- Use arrow keys for navigation
- Press Enter to select

## 🔧 Common Issues

### Metro Bundler Issues:

```bash
npm start -- --reset-cache
```

### Build Failures:

```bash
cd android
./gradlew clean
cd ..
npm install
```

### Port Already in Use:

```bash
npx react-native start --port 8082
```

Then in another terminal:
```bash
npx react-native run-android --port 8082
```

### App Not Installing:

```bash
adb uninstall com.lenz
npm run android
```

## 📊 Verifying Installation

After successful installation, you should see:
- ✅ Full-screen video player
- ✅ Bottom channel bar with icons
- ✅ Ability to navigate with remote/touch
- ✅ Smooth channel switching with fade effect

## 🎯 Next Steps

1. **Customize API**: Edit `src/services/api.js` to change data source
2. **Modify Styling**: Update component styles in `src/components/`
3. **Add Features**: Check README.md for enhancement ideas

## 📞 Need Help?

- Check main README.md for detailed documentation
- Review code comments in source files
- Check React Native documentation: https://reactnative.dev

---

**Happy Streaming! 📺**




