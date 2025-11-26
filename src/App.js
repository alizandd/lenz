import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, StatusBar, DeviceEventEmitter, Text, TouchableWithoutFeedback, BackHandler, Alert, Linking, Platform, NativeModules } from 'react-native';
import VideoPlayer from './components/VideoPlayer';
import ChannelList from './components/ChannelList';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import ExitModal from './components/ExitModal';
import FullScreenAd from './components/FullScreenAd';
import useChannels from './hooks/useChannels';
import { formatDateTime } from './utils/helpers';

/**
 * Main App Component
 * Manages the application state and coordinates between video player and channel list
 */
const App = () => {
  const {
    channels,
    selectedChannel,
    loading,
    error,
    selectChannel,
    reloadChannels,
  } = useChannels();

  const channelListRef = useRef(null);

  /**
   * Subscribe to native Android key events sent from MainActivity
   */
  /**
   * Handle hardware back button
   */
  const [exitModalVisible, setExitModalVisible] = React.useState(false);
  const [adVisible, setAdVisible] = React.useState(false);
  const [adShown, setAdShown] = React.useState(false);
  const [pendingChannel, setPendingChannel] = React.useState(null);

  /**
   * Handle hardware back button
   */
  useEffect(() => {
    const backAction = () => {
      if (exitModalVisible) {
        setExitModalVisible(false);
        return true;
      }

      if (channelListRef.current && channelListRef.current.isVisible()) {
        channelListRef.current.hide();
        return true;
      }

      setExitModalVisible(true);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [exitModalVisible]);

  /**
   * Global handler for navigation direction (called from ChannelList)
   * This mimics key direction handling at the Home level.
   */
  const handleDirectionChange = useCallback((direction, meta) => {
    console.log('Home direction event:', direction, meta);
  }, []);

  /**
   * Handle channel selection
   * @param {Object} channel - Selected channel object
   */
  const [unavailableMessage, setUnavailableMessage] = React.useState(null);

  /**
   * Handle channel selection
   * @param {Object} channel - Selected channel object
   */
  const handleChannelSelect = useCallback(
    (channel) => {
      // Check if ad should be shown (first click in session)
      if (!adShown) {
        setPendingChannel(channel);
        setAdVisible(true);
        setAdShown(true);
        return;
      }

      const now = new Date();
      console.log('Now:', now);
      console.log('Start:', channel.start);
      console.log('End:', channel.end);
      if (channel.start && channel.end) {
        const now = new Date();
        // Ensure proper parsing by replacing space with T
        const start = new Date(channel.start.replace(' ', 'T'));
        const end = new Date(channel.end.replace(' ', 'T'));

        if (now < start) {
          const formattedStart = formatDateTime(channel.start);
          setUnavailableMessage(`کانال ${channel.title} در تاریخ ${formattedStart} در دسترس هست`);
          selectChannel(null); // Deselect current channel if any
          return;
        }
      }

      setUnavailableMessage(null);
      selectChannel(channel);
    },
    [selectChannel, adShown],
  );

  /**
   * Handle deep links
   */
  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      console.log('Deep link received:', url);
      if (url) {
        // Expected format: lenz://channel/<id>
        const route = url.replace(/.*?:\/\//g, '');
        const [path, id] = route.split('/');

        if (path === 'channel' && id) {
          console.log('Deep link to channel ID:', id);
          // Find the channel with the matching ID
          const targetChannel = channels.find(c => c.id.toString() === id);
          if (targetChannel) {
            handleChannelSelect(targetChannel);
          } else {
            console.warn('Channel not found for deep link ID:', id);
          }
        }
      }
    };

    // Handle app launch from deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Handle deep link while app is running
    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      linkingSubscription.remove();
    };
  }, [channels, handleChannelSelect]);

  /**
   * Handle video playback errors
   * @param {Object} videoError - Video error object
   */
  const handleVideoError = useCallback((videoError) => {
    console.error('Video playback error:', videoError);
    // Could implement retry logic or fallback here
  }, []);

  /**
   * Handle screen touch to show channel list
   */
  const handleScreenTouch = () => {
    if (channelListRef.current) {
      // On mobile, toggle the list. On TV, just show it (though touch is rare on TV)
      const isTV = Platform.isTV || Platform.OS === 'tv';
      if (isTV) {
        channelListRef.current.show();
      } else {
        channelListRef.current.toggle();
      }
    }
  };

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <>
        <StatusBar hidden={true} />
        <LoadingScreen />
      </>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <>
        <StatusBar hidden={true} />
        <ErrorScreen message={error} onRetry={reloadChannels} />
      </>
    );
  }

  /**
   * Render main application
   */
  return (
    <TouchableWithoutFeedback onPress={handleScreenTouch}>
      <View style={styles.container}>
        <StatusBar hidden={true} />

        {/* Full screen video player */}
        {selectedChannel && selectedChannel.link && !unavailableMessage && (
          <VideoPlayer
            streamUrl={selectedChannel.link}
            onError={handleVideoError}
            onPress={handleScreenTouch}
            paused={adVisible}
          />
        )}

        {/* Unavailable Message Overlay */}
        {unavailableMessage && (
          <View style={styles.centerOverlay}>
            <Text style={styles.overlayText}>{unavailableMessage}</Text>
          </View>
        )}

        {/* Now playing overlay */}
        {selectedChannel?.title && !unavailableMessage && (
          <View style={styles.nowPlaying}>
            <Text
              style={[styles.nowPlayingText, { flexWrap: 'wrap', textAlign: 'right' }]}>
              {selectedChannel.title}
            </Text>
          </View>
        )}

        {/* Bottom channel list overlay */}
        {channels.length > 0 && (
          <ChannelList
            ref={channelListRef}
            channels={channels}
            selectedChannelId={selectedChannel?.id}
            onChannelSelect={handleChannelSelect}
            paused={exitModalVisible}
          />
        )}

        <ExitModal
          visible={exitModalVisible}
          onConfirm={() => {
            // Use native module to properly exit the app
            const { ExitModule } = NativeModules;
            if (ExitModule) {
              ExitModule.exitApp();
            } else {
              // Fallback to BackHandler
              BackHandler.exitApp();
            }
          }}
          onCancel={() => setExitModalVisible(false)}
        />

        <FullScreenAd
          visible={adVisible}
          onClose={() => {
            setAdVisible(false);
            if (pendingChannel) {
              // Recursively call handleChannelSelect or just directly select
              // Since we already set adShown to true, calling handleChannelSelect would work but might be redundant check
              // Let's just duplicate the logic or call a helper. 
              // Actually, calling handleChannelSelect again is safe because adShown is now true.
              handleChannelSelect(pendingChannel);
              setPendingChannel(null);
            }
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  nowPlaying: {
    position: 'absolute',
    top: 18,
    start: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  nowPlayingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'IRANSans-Medium',
  },
  centerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',

  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'IRANSans-Medium',
    textAlign: 'center',
    padding: 20,
    // writingDirection: 'rtl', // Default is RTL now
  },
});

export default App;
