# Architecture Documentation - Lenz TV

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Lenz TV Application                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │              App.js (Main Entry)                │    │
│  │  - State Management via useChannels hook       │    │
│  │  - Component Orchestration                     │    │
│  └─────────────┬──────────────────────────────────┘    │
│                │                                         │
│       ┌────────┴────────┬──────────────┐               │
│       ▼                 ▼              ▼               │
│  ┌─────────┐    ┌──────────────┐  ┌─────────┐        │
│  │ Video   │    │   Channel    │  │ Loading │        │
│  │ Player  │    │     List     │  │ /Error  │        │
│  └────┬────┘    └──────┬───────┘  └─────────┘        │
│       │                │                               │
│       │                │                               │
│  ┌────▼────────────────▼──────────────────────┐      │
│  │         Services & Utilities                │      │
│  │  - API Service (fetchChannels)              │      │
│  │  - Custom Hooks (useChannels)               │      │
│  │  - Constants & Configuration                │      │
│  └────────────────┬────────────────────────────┘      │
│                   │                                    │
│  ┌────────────────▼────────────────────────────┐      │
│  │         External Services                    │      │
│  │  - HLS Video Streams                         │      │
│  │  - REST API (hamsam.tvapps.ir)              │      │
│  └──────────────────────────────────────────────┘      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🏗️ Component Hierarchy

```
App
├── LoadingScreen (Conditional)
├── ErrorScreen (Conditional)
└── Main View
    ├── VideoPlayer
    │   └── react-native-video (HLS playback)
    └── ChannelList
        └── ScrollView
            └── ChannelItems (Array)
                └── TouchableOpacity
                    └── Image (Channel Icon)
```

## 📦 Module Structure

### `/src`
Main application source code

#### `/src/components`
React components for UI elements

- **VideoPlayer.js**: HLS video player with fade transitions
  - Manages video playback state
  - Handles fade animations
  - Error handling for video streams
  
- **ChannelList.js**: Horizontal scrollable channel list
  - TV remote D-pad navigation
  - Touch/click support
  - Focus state management
  - Auto-scrolling to focused item
  
- **LoadingScreen.js**: Loading state component
  - Shows activity indicator
  - Displays Persian loading text
  
- **ErrorScreen.js**: Error state component
  - Shows error message
  - Retry button functionality

#### `/src/services`
External service integrations

- **api.js**: REST API service
  - Fetches channel data
  - Error handling
  - Response parsing

#### `/src/hooks`
Custom React hooks

- **useChannels.js**: Channel management hook
  - Loads channels on mount
  - Manages selected channel state
  - Provides reload functionality
  - Error and loading states

#### `/src/utils`
Utility functions and constants

- **constants.js**: Application-wide constants
  - API configuration
  - UI configuration
  - Color scheme
  - Message strings

### `/android`
Android native code and configuration

- **AndroidManifest.xml**: TV features and permissions
- **build.gradle**: Build configuration
- **MainActivity.java**: Main activity class
- **MainApplication.java**: Application initialization

## 🔄 Data Flow

### 1. Application Initialization
```
App Component Mounts
    ↓
useChannels Hook Executes
    ↓
fetchChannels() Called
    ↓
API Request to hamsam.tvapps.ir
    ↓
Response Parsed & Stored
    ↓
First Channel Auto-Selected
    ↓
UI Renders with Data
```

### 2. Channel Selection Flow
```
User Interaction (Touch/Remote)
    ↓
ChannelList detects event
    ↓
onChannelSelect callback fired
    ↓
selectChannel() in hook
    ↓
selectedChannel state updated
    ↓
VideoPlayer receives new streamUrl
    ↓
Fade out animation starts
    ↓
Video source changes
    ↓
Fade in animation starts
    ↓
New channel plays
```

### 3. TV Remote Navigation Flow
```
D-pad Button Press
    ↓
TVEventHandler captures event
    ↓
Event type determined (left/right/select)
    ↓
focusedIndex updated
    ↓
ScrollView auto-scrolls
    ↓
Visual focus indicator updates
    ↓
(If select) Channel switches
```

## 🎨 Styling Architecture

### Style Organization
Each component contains its own StyleSheet at the bottom of the file.

### Responsive Design
- Uses `Dimensions.get('window')` for screen size
- Percentage-based sizing for overlay (30% of screen height)
- Supports both TV (landscape) and mobile (portrait/landscape)

### Theme System
Colors defined in `src/utils/constants.js`:
- Primary: Gold (#FFD700)
- Background: Black (#000000)
- Error: Red (#FF6B6B)
- Focus/Selected indicators

## 🔐 Security Considerations

### Network Security
- Uses HTTPS for API calls (axios default)
- `usesCleartextTraffic="true"` in manifest for HTTP HLS streams
  - ⚠️ Consider enabling only for development
  
### Permissions
- Minimal permissions requested
- No sensitive data storage
- No location/camera requirements

## 📊 State Management

### Local State (useState)
- Component-level UI state
- Animation values
- Focus indices

### Custom Hooks
- Shared business logic
- API data management
- Side effect coordination

### Why No Redux/MobX?
- Simple state requirements
- Single data source (API)
- No complex state synchronization needed

## 🚀 Performance Optimizations

### Video Player
- Native video rendering (react-native-video)
- Hardware acceleration
- Efficient fade transitions with native driver

### Channel List
- ScrollView with efficient rendering
- Image caching by React Native
- Debounced navigation events

### Memory Management
- Cleanup in useEffect hooks
- Proper event handler disposal
- No memory leaks in animations

## 🧪 Testing Strategy

### Unit Tests (Future)
- API service functions
- Custom hooks
- Utility functions

### Component Tests (Future)
- Component rendering
- User interaction simulation
- Navigation logic

### Integration Tests (Future)
- Full user flows
- API integration
- Video playback

## 🔄 Future Scalability

### Potential Enhancements
1. **State Management Library**: If state complexity grows
2. **TypeScript**: For type safety
3. **Code Splitting**: For larger applications
4. **Offline Support**: Cache channels and videos
5. **Analytics**: User behavior tracking
6. **A/B Testing**: Feature experimentation

### Module Extension Points
- Add new components to `/src/components`
- Add new hooks to `/src/hooks`
- Add new services to `/src/services`
- Extend constants in `/src/utils/constants.js`

## 📱 Platform Support

### Current Support
- ✅ Android TV (API 21+)
- ✅ Android Mobile (API 21+)
- ✅ Fire TV

### Potential Future Support
- 📱 iOS/tvOS (requires additional configuration)
- 🌐 Web (React Native Web)
- 🖥️ Desktop (Electron wrapper)

## 🔧 Build System

### Development Build
```bash
npm run android
```
- Debug APK
- Metro bundler
- Fast refresh enabled

### Production Build
```bash
cd android
./gradlew assembleRelease
```
- Optimized bundle
- ProGuard enabled (optional)
- Code shrinking

---

**Architecture designed for scalability, maintainability, and performance.**







