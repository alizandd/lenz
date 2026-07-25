import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, StatusBar, DeviceEventEmitter, Text, TouchableWithoutFeedback, BackHandler, Alert, Linking, Platform, NativeModules } from 'react-native';
import VideoPlayer from './components/VideoPlayer';
import ChannelList from './components/ChannelList';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import Toast from './components/Toast';
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
  const [adVisible, setAdVisible] = useState(false);
  const [adShown, setAdShown] = useState(false);
  const [pendingChannel, setPendingChannel] = useState(null);

  // Toast state for double back to exit
  const [toastVisible, setToastVisible] = useState(false);
  const lastBackPress = useRef(0);
  const toastTimeout = useRef(null);

  /**
   * Handle hardware back button
   */
  useEffect(() => {
    const backAction = () => {
      // If ad is visible, let the ad component handle it or close it?
      // The ad component usually has its own close button, but back should probably close it too if it's an overlay.
      // However, the original code didn't seem to handle ad closing with back button explicitly in backAction, 
      // but let's stick to the requested logic first.

      if (adVisible) {
        // Optional: Close ad on back press if desired, but user didn't specify.
        // For now, let's assume ad handles itself or user must click close.
        // But usually back should close modals.
        // Let's leave ad logic as is for now to avoid side effects.
      }

      if (channelListRef.current && channelListRef.current.isVisible()) {
        channelListRef.current.hide();
        return true;
      }

      const now = Date.now();
      const DOUBLE_PRESS_DELAY = 2000;

      if (lastBackPress.current && now - lastBackPress.current < DOUBLE_PRESS_DELAY) {
        // Double press detected, exit app
        const { ExitModule } = NativeModules;
        if (ExitModule) {
          ExitModule.exitApp();
        } else {
          BackHandler.exitApp();
        }
        return true;
      }

      lastBackPress.current = now;
      setToastVisible(true);

      // Hide toast after delay
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => {
        setToastVisible(false);
      }, DOUBLE_PRESS_DELAY);

      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => {
      backHandler.remove();
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, [adVisible]);

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
  const [unavailableMessage, setUnavailableMessage] = useState(null);

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
    // Don't process deep links until channels are loaded
    if (loading || channels.length === 0) {
      return;
    }

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
            // Show the channel list to reflect "focus and show"
            if (channelListRef.current) {
              channelListRef.current.show();
            }
          } else {
            console.warn('Channel not found for deep link ID:', id);
            console.log('Available channel IDs:', channels.map(c => c.id).join(', '));
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
  }, [channels, loading, handleChannelSelect]);

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
            paused={false}
          />
        )}

        <Toast
          visible={toastVisible}
          message="برای خروج یکبار دیگر دکمه بازگشت را بزنید"
        />

        <FullScreenAd
          visible={adVisible}
          onClose={() => {
            setAdVisible(false);
            // Delay channel selection to allow WebView to cleanup and Modal to close
            setTimeout(() => {
              if (pendingChannel) {
                handleChannelSelect(pendingChannel);
                setPendingChannel(null);
              }
            }, 500);
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

