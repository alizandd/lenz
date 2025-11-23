# Installation Guide - Lenz TV

Complete step-by-step installation instructions for setting up Lenz TV on your development machine and deploying to Android TV or mobile devices.

## 📋 System Requirements

### Development Machine
- **Operating System**: Windows 10/11, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space
- **Internet**: Stable broadband connection

### Software Requirements
- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher (comes with Node.js)
- **Java Development Kit (JDK)**: Version 11 or higher
- **Android Studio**: Latest version (Chipmunk or newer)
- **Android SDK**: API Level 21+ (Android 5.0+)
- **Git**: Latest version (optional, for cloning)

### Target Devices
- **Android TV**: API 21+ (Android 5.0+)
- **Android Mobile**: API 21+ (Android 5.0+)
- **Fire TV**: All generations supported

---

## 🔧 Step 1: Install Prerequisites

### Windows

#### 1.1 Install Node.js
1. Download Node.js LTS from: https://nodejs.org/
2. Run the installer (.msi file)
3. Follow installation wizard (accept defaults)
4. Verify installation:
```bash
node --version
npm --version
```

#### 1.2 Install Java JDK
1. Download Java JDK 11 from: https://adoptium.net/
2. Run installer
3. Set JAVA_HOME environment variable:
   - Open System Properties → Advanced → Environment Variables
   - Add new System Variable:
     - Name: `JAVA_HOME`
     - Value: `C:\Program Files\Eclipse Adoptium\jdk-11.x.x.x-hotspot`
4. Verify:
```bash
java -version
```

#### 1.3 Install Android Studio
1. Download from: https://developer.android.com/studio
2. Run installer
3. Follow setup wizard:
   - Choose "Standard" installation
   - Accept all SDK licenses
   - Wait for SDK downloads
4. Open Android Studio
5. Go to: More Actions → SDK Manager
6. Install required components:
   - Android SDK Platform 33
   - Android SDK Build-Tools 33.0.0
   - Android Emulator
   - Android SDK Platform-Tools
   - Android SDK Command-line Tools

#### 1.4 Set Android Environment Variables
1. Open System Properties → Environment Variables
2. Add to System Variables:
   - `ANDROID_HOME`: `C:\Users\YourUsername\AppData\Local\Android\Sdk`
3. Add to Path:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\emulator`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`

### macOS

#### 1.1 Install Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 1.2 Install Node.js
```bash
brew install node
```

#### 1.3 Install Java JDK
```bash
brew install --cask adoptopenjdk11
```

#### 1.4 Install Android Studio
1. Download from: https://developer.android.com/studio
2. Drag Android Studio.app to Applications folder
3. Open Android Studio and complete setup
4. Install required SDK components (same as Windows)

#### 1.5 Set Environment Variables
Add to `~/.zshrc` or `~/.bash_profile`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Then run:
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

### Linux (Ubuntu/Debian)

#### 1.1 Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 1.2 Install Java JDK
```bash
sudo apt update
sudo apt install openjdk-11-jdk
```

#### 1.3 Install Android Studio
```bash
sudo snap install android-studio --classic
```
Then complete setup and install SDK components.

#### 1.4 Set Environment Variables
Add to `~/.bashrc`:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Then run:
```bash
source ~/.bashrc
```

---

## 📥 Step 2: Download Project

### Option A: From Git Repository
```bash
git clone <repository-url>
cd Lenz
```

### Option B: From ZIP Archive
1. Extract ZIP file to desired location
2. Open terminal/command prompt
3. Navigate to extracted folder:
```bash
cd path/to/Lenz
```

---

## 📦 Step 3: Install Dependencies

```bash
npm install
```

This will install:
- React Native and dependencies
- react-native-video for HLS playback
- axios for API requests
- All development tools

**Expected time:** 2-5 minutes depending on internet speed

### Troubleshooting
If you encounter errors:

**Error: EACCES (Permission denied)**
```bash
# macOS/Linux:
sudo chown -R $USER ~/.npm

# Windows: Run terminal as Administrator
```

**Error: Network timeout**
```bash
npm install --network-timeout 100000
```

---

## 🖥️ Step 4: Setup Android Device/Emulator

### Option A: Physical Android TV Device

#### 4.1 Enable Developer Mode
1. On your Android TV, go to: **Settings → About**
2. Find **Build number** and click it **7 times**
3. You'll see "You are now a developer!"

#### 4.2 Enable USB Debugging
1. Go to: **Settings → System → Developer Options**
2. Enable **USB debugging**
3. Enable **Install via USB** (if available)

#### 4.3 Connect Device
**Via USB:**
1. Connect TV to computer with USB cable
2. On TV, accept USB debugging prompt
3. Verify connection:
```bash
adb devices
```

**Via WiFi (if same network):**
1. On TV, go to Developer Options
2. Enable **Network debugging**
3. Note TV's IP address (Settings → Network)
4. On computer:
```bash
adb connect <TV_IP_ADDRESS>:5555
```
5. Verify:
```bash
adb devices
```

### Option B: Android TV Emulator

#### 4.1 Create Emulator
1. Open Android Studio
2. Click: **More Actions → AVD Manager**
3. Click: **Create Virtual Device**
4. Select: **TV** category
5. Choose device: **Android TV (1080p)**
6. Select system image: **API 29 or higher**
7. Click: **Finish**

#### 4.2 Start Emulator
1. In AVD Manager, click **▶️ Play** button
2. Wait for emulator to boot (1-2 minutes)
3. Verify:
```bash
adb devices
```

### Option C: Android Mobile Device

#### For Testing on Mobile
1. Enable Developer Options (click Build Number 7 times)
2. Enable USB Debugging
3. Connect via USB
4. Accept debugging prompt
5. Verify:
```bash
adb devices
```

---

## 🚀 Step 5: Run the Application

### Quick Start (Automated)

**Windows:**
```bash
setup.bat
```

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Start

#### 5.1 Start Metro Bundler
Open terminal 1:
```bash
npm start
```
**Keep this terminal running!**

#### 5.2 Build and Install
Open terminal 2:
```bash
npm run android
```

This will:
1. Build the Android APK
2. Install on connected device/emulator
3. Launch the application

**Expected time:** 2-5 minutes (first build is slower)

### Success!
If everything worked, you should see:
- ✅ Application opens on device
- ✅ Full-screen video player
- ✅ Channel list at bottom
- ✅ Channels load from API

---

## 🔍 Step 6: Verify Installation

### Checklist
- [ ] App opens without errors
- [ ] Video starts playing automatically
- [ ] Channel icons display in bottom bar
- [ ] Can navigate channels with touch/remote
- [ ] Channel switching works smoothly
- [ ] Fade transition is visible
- [ ] No error messages in terminal

### Test TV Remote (if on TV)
- Press **Right arrow** → Should move focus to next channel
- Press **Left arrow** → Should move focus to previous channel
- Press **Select/Enter** → Should switch to focused channel

---

## 🏗️ Step 7: Build Release APK (Optional)

For distribution or production use:

```bash
cd android
./gradlew assembleRelease   # macOS/Linux
gradlew.bat assembleRelease  # Windows
cd ..
```

**Output location:**
```
android/app/build/outputs/apk/release/app-release.apk
```

### Sign APK for Distribution
1. Generate keystore:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore lenz-release.keystore -alias lenz -keyalg RSA -keysize 2048 -validity 10000
```

2. Configure signing in `android/app/build.gradle`

3. Build signed release:
```bash
cd android
./gradlew assembleRelease
```

---

## 🛠️ Troubleshooting Installation

### Issue: "SDK location not found"
**Solution:**
Create `android/local.properties`:
```properties
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```
(Use forward slashes on macOS/Linux)

### Issue: "Unable to locate adb"
**Solution:**
Add platform-tools to PATH and restart terminal

### Issue: "Command not found: npm"
**Solution:**
Reinstall Node.js and restart terminal

### Issue: Build fails with "Execution failed for task ':app:installDebug'"
**Solution:**
```bash
adb devices        # Check device is connected
adb kill-server    # Kill ADB
adb start-server   # Restart ADB
npm run android    # Try again
```

### Issue: "Metro Bundler not running"
**Solution:**
```bash
npm start -- --reset-cache
```

### Issue: "Application not installed"
**Solution:**
```bash
adb uninstall com.lenz
npm run android
```

---

## 📱 Step 8: Install on Multiple Devices

To install on multiple devices:

1. List all connected devices:
```bash
adb devices
```

2. Install on specific device:
```bash
npx react-native run-android --deviceId=<DEVICE_ID>
```

3. Or install APK manually:
```bash
adb -s <DEVICE_ID> install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🎓 Next Steps

After successful installation:

1. **Customize API**: Edit `src/services/api.js` to use your channel source
2. **Modify Styling**: Update component styles to match your brand
3. **Add Features**: See `README.md` for enhancement ideas
4. **Test Thoroughly**: Test on target devices
5. **Prepare for Distribution**: Build release APK and deploy

---

## 📚 Additional Resources

- **React Native Docs**: https://reactnative.dev/docs/environment-setup
- **Android TV Development**: https://developer.android.com/tv
- **React Native Video**: https://github.com/react-native-video/react-native-video
- **HLS Streaming**: https://developer.apple.com/streaming/

---

## 💡 Pro Tips

1. **Use Physical TV for Testing**: Emulator is good for development, but test on real TV before release
2. **Keep Metro Running**: Faster development with hot reload
3. **Clear Cache Often**: Run `npm start -- --reset-cache` if issues occur
4. **Monitor Logs**: Use `adb logcat` to see detailed error messages
5. **Test Network Errors**: Disconnect internet to test error handling

---

## ✅ Installation Complete!

You now have a fully functional Lenz TV application ready for development or deployment.

**Next:** Check `QUICKSTART.md` for daily development workflow or `README.md` for full documentation.

---

**Need Help?** See `TROUBLESHOOTING.md` or review the installation steps above.




