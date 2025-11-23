# Lenz TV - Android TV Live Streaming Application

A production-ready React Native application for streaming live Persian TV channels on Android TV and mobile devices. Features full HLS video playback, TV remote control navigation, and smooth channel switching with fade transitions.

## 🎯 Features

- **Full-Screen HLS Video Playback**: Seamless streaming of live TV channels
- **TV Remote Navigation**: Complete D-pad support for Android TV
- **Touch Support**: Works perfectly on mobile devices
- **Persian/RTL Support**: Designed for Persian-speaking users
- **Channel Overlay**: Bottom bar displaying horizontal scrollable channel list
- **Smooth Transitions**: Fade effects when switching channels
- **Responsive Layout**: Adapts to both TV and mobile screen sizes
- **Focus States**: Visual feedback with border styling for TV navigation
- **Cross-Platform**: Works on Android TV, Fire TV, and Android mobile devices

## 📋 Prerequisites

- **Node.js**: v16 or higher
- **npm** or **yarn**: Latest version
- **Android Studio**: Latest version with Android SDK
- **Java Development Kit (JDK)**: Version 11 or higher
- **React Native CLI**: `npm install -g react-native-cli`

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Lenz
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Install React Native Video

The project uses `react-native-video` for HLS playback. If not already installed:

```bash
npm install react-native-video
# or
yarn add react-native-video
```

### 4. Link Native Dependencies (if needed)

For React Native versions < 0.60:

```bash
react-native link react-native-video
```

For React Native 0.60+, autolinking should handle this automatically.

## 🔧 Configuration

### Android TV Setup

The project is already configured for Android TV with the following features:

- `android.software.leanback` feature for TV support
- `LEANBACK_LAUNCHER` intent filter for TV launcher visibility
- Touchscreen marked as optional
- Full-screen immersive mode

### API Configuration

The application fetches channel data from:

```
https://hamsam.tvapps.ir/api/v1/lives
```

To change the API endpoint, edit `src/services/api.js`:

```javascript
const API_BASE_URL = 'https://your-api-url.com/api/v1';
```

## 🏃 Running the Application

### Start Metro Bundler

```bash
npm start
# or
yarn start
```

### Run on Android TV / Mobile Device

```bash
npm run android
# or
yarn android
```

### Run on Android TV Emulator

1. Open Android Studio
2. Create an Android TV AVD (Android Virtual Device)
3. Start the emulator
4. Run: `npm run android`

### Build Release APK

```bash
cd android
./gradlew assembleRelease
```

The APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## 📱 Usage

### TV Remote Controls

- **D-pad Left/Right**: Navigate between channels
- **D-pad Select/Enter**: Select a channel to play
- **Back Button**: Exit application

### Touch Controls (Mobile)

- **Tap**: Select a channel to play
- **Swipe**: Scroll through channel list

## 🏗️ Project Structure

```
Lenz/
├── src/
│   ├── components/
│   │   ├── VideoPlayer.js      # HLS video player with fade transitions
│   │   └── ChannelList.js      # Horizontal channel list with TV navigation
│   ├── services/
│   │   └── api.js              # API service for fetching channel data
│   └── App.js                  # Main application component
├── android/                    # Android native code
│   ├── app/
│   │   └── src/
│   │       └── main/
│   │           ├── AndroidManifest.xml  # TV configuration
│   │           └── java/com/lenz/       # Java/Kotlin code
│   ├── build.gradle
│   └── settings.gradle
├── index.js                    # Application entry point
├── package.json               # Dependencies
└── README.md                  # This file
```

## 🎨 Customization

### Styling

Edit styles in respective component files:

- **Video Player**: `src/components/VideoPlayer.js`
- **Channel List**: `src/components/ChannelList.js`
- **App Layout**: `src/App.js`

### Channel Overlay Height

To adjust the bottom overlay height (default is 30%):

```javascript
// In src/components/ChannelList.js
const styles = StyleSheet.create({
  container: {
    height: height * 0.3, // Change 0.3 to desired percentage (e.g., 0.4 for 40%)
  },
});
```

### Fade Transition Duration

To adjust channel switching transition speed:

```javascript
// In src/components/VideoPlayer.js
Animated.timing(fadeAnim, {
  toValue: 0,
  duration: 300, // Change to desired duration in milliseconds
  useNativeDriver: true,
})
```

## 🐛 Troubleshooting

### Video Not Playing

1. Ensure the device has internet connectivity
2. Check if the HLS stream URL is valid
3. Verify that `react-native-video` is properly installed
4. Check Android permissions in `AndroidManifest.xml`

### TV Remote Not Working

1. Ensure the device is recognized as a TV (check `android.software.leanback`)
2. Verify `hasTVPreferredFocus` is set on the first channel item
3. Test with Android TV emulator first

### Build Failures

1. Clean the build:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```
2. Remove and reinstall dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```
3. Clear Metro cache:
   ```bash
   npm start -- --reset-cache
   ```

### App Not Visible in TV Launcher

Ensure `AndroidManifest.xml` contains:

```xml
<intent-filter>
    <action android:name="android.intent.action.MAIN" />
    <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
</intent-filter>
```

## 📦 Dependencies

- **react**: ^18.2.0
- **react-native**: ^0.72.6
- **react-native-video**: ^5.2.1
- **axios**: ^1.6.0

## 🔒 Permissions

The application requires the following permissions:

- `android.permission.INTERNET`: For streaming video content
- `android.permission.ACCESS_NETWORK_STATE`: For checking network connectivity

## 🌐 API Response Format

The application expects the following JSON structure from the API:

```json
{
  "status": "success",
  "message": null,
  "data": [
    {
      "id": 29,
      "title": "Channel Name",
      "icon": "https://url-to-icon.png",
      "image": "https://url-to-banner.png",
      "link": "https://hls-stream-url.m3u8",
      "description": "Channel description",
      "status": false,
      "start": "2025-11-01 14:07:49",
      "end": "2025-11-01 14:07:53"
    }
  ]
}
```

## 🚀 Deployment

### Google Play Store

1. Generate a signed APK/AAB
2. Create a Google Play Console account
3. Upload the APK/AAB with appropriate screenshots and descriptions
4. Submit for review

### Amazon Fire TV

1. Register for Amazon Developer account
2. Upload the APK to Amazon Appstore
3. Complete app submission form
4. Submit for review

## 📝 License

This project is licensed under the MIT License.

## 👥 Support

For issues, questions, or contributions, please contact the development team or create an issue in the repository.

## 🔄 Updates

To update the application:

1. Pull latest changes
2. Run `npm install` to update dependencies
3. Rebuild the application

## ⚡ Performance Tips

1. **Video Caching**: Consider implementing video caching for frequently watched channels
2. **Image Optimization**: Optimize channel icons for faster loading
3. **Lazy Loading**: Implement lazy loading for channel lists with many items
4. **Error Handling**: Add retry logic for failed video streams

## 🎯 Future Enhancements

- [ ] Add EPG (Electronic Program Guide) support
- [ ] Implement favorite channels feature
- [ ] Add parental controls
- [ ] Support for multiple video quality options
- [ ] Offline mode with cached content
- [ ] Multi-language support beyond Persian
- [ ] Voice search integration
- [ ] Picture-in-Picture (PiP) mode

---

**Built with ❤️ for Persian TV viewers**




