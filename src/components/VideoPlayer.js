import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, Animated, View, Text, TouchableWithoutFeedback } from 'react-native';
import Video from 'react-native-video';

/**
 * VideoPlayer Component
 * Displays HLS video stream with fade transition effects
 * 
 * @param {string} streamUrl - HLS stream URL to play
 * @param {Function} onError - Callback when video playback error occurs
 * @param {Function} onPress - Callback when video is pressed
 * @param {boolean} paused - Whether the video should be paused
 */
const PLAYER_CONFIGS = [
  {
    name: 'Default (Texture)',
    props: {
      useTextureView: true,
      minLoadRetryCount: 5, // Retry more on network failure
      bufferConfig: {
        minBufferMs: 10000, // Reduced from 15000 to be more responsive
        maxBufferMs: 50000,
        bufferForPlaybackMs: 2500,
        bufferForPlaybackAfterRebufferMs: 5000,
      },
    },
  },
  {
    name: 'Force HLS (Texture)',
    props: {
      useTextureView: true,
      type: 'm3u8',
      minLoadRetryCount: 5,
      bufferConfig: {
        minBufferMs: 15000,
        maxBufferMs: 50000,
        bufferForPlaybackMs: 2500,
        bufferForPlaybackAfterRebufferMs: 5000,
      },
    },
  },
  {
    name: 'SurfaceView (Robust)',
    props: {
      useTextureView: false, // SurfaceView is more stable on older Android TVs
      type: 'm3u8',
      minLoadRetryCount: 5,
      bufferConfig: {
        minBufferMs: 15000,
        maxBufferMs: 50000,
        bufferForPlaybackMs: 2500,
        bufferForPlaybackAfterRebufferMs: 5000,
      },
    },
  },
  {
    name: 'High Buffer (Surface)',
    props: {
      useTextureView: false,
      type: 'm3u8',
      minLoadRetryCount: 5,
      bufferConfig: {
        minBufferMs: 30000,
        maxBufferMs: 100000,
        bufferForPlaybackMs: 5000,
        bufferForPlaybackAfterRebufferMs: 10000,
      },
    },
  },
];

const VideoPlayer = ({ streamUrl, onError, onPress, paused = false }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const videoRef = useRef(null);
  const previousUrl = useRef(streamUrl);

  // State for adaptive config
  const [configIndex, setConfigIndex] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [maxBitrate, setMaxBitrate] = useState(1000000); // Start with 1Mbps to ensure fast start

  useEffect(() => {
    // Uncap bitrate after 10 seconds to allow switching to higher quality
    const timer = setTimeout(() => {
      setMaxBitrate(undefined);
    }, 10000);
    return () => clearTimeout(timer);
  }, [streamUrl, reloadKey]);

  // Watchdog refs
  const loadTimeoutRef = useRef(null);
  const lastProgressRef = useRef(0);
  const stallCheckIntervalRef = useRef(null);

  const currentConfig = PLAYER_CONFIGS[configIndex];

  useEffect(() => {
    // Reset config when URL changes
    if (previousUrl.current !== streamUrl) {
      setConfigIndex(0); // Start fresh with best quality
      setReloadKey(k => k + 1);
      setIsLoading(true);

      // Fade out/in animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        previousUrl.current = streamUrl;
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [streamUrl, fadeAnim]);

  // Watchdog: Check if video loads within 15 seconds
  useEffect(() => {
    clearTimeout(loadTimeoutRef.current);
    clearInterval(stallCheckIntervalRef.current);

    if (!paused) {
      // 1. Initial Load Timeout
      loadTimeoutRef.current = setTimeout(() => {
        if (isLoading) {
          console.warn(`[VideoPlayer] Load timeout on config ${configIndex} (${currentConfig.name}). Switching...`);
          handlePlaybackIssue();
        }
      }, 15000);

      // 2. Stall/Freeze Detection (optional, simple version)
      // We can check if onProgress stops firing for too long
    }

    return () => {
      clearTimeout(loadTimeoutRef.current);
      clearInterval(stallCheckIntervalRef.current);
    };
  }, [reloadKey, configIndex, isLoading, paused]);

  const handlePlaybackIssue = (error) => {
    console.log(`[VideoPlayer] Issue detected: ${error?.error?.errorString || 'Timeout/Stall'}`);

    // If we have more configs to try, switch to the next one
    if (configIndex < PLAYER_CONFIGS.length - 1) {
      const nextIndex = configIndex + 1;
      console.log(`[VideoPlayer] Switching to config ${nextIndex}: ${PLAYER_CONFIGS[nextIndex].name}`);
      setConfigIndex(nextIndex);
      setReloadKey(k => k + 1); // Force remount
      setIsLoading(true);
    } else {
      // We ran out of configs, report error to parent
      console.error('[VideoPlayer] All configs failed.');
      onError?.(error || new Error('Playback failed on all configurations'));
    }
  };

  const onVideoLoad = () => {
    console.log(`[VideoPlayer] Loaded successfully with config: ${currentConfig.name}`);
    setIsLoading(false);
    clearTimeout(loadTimeoutRef.current);
  };

  const onVideoProgress = (data) => {
    lastProgressRef.current = Date.now();
    if (isLoading) setIsLoading(false); // Ensure we mark as loaded if progress starts
  };

  const onVideoError = (error) => {
    handlePlaybackIssue(error);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Video
        key={`${reloadKey}-${streamUrl}-${configIndex}`}
        ref={videoRef}
        source={{
          uri: streamUrl,
          headers: {
            'Referer': 'https://www.aparat.com/',
            'Accept': '*/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', // Added UA for better compatibility
          },
        }}
        style={styles.video}
        resizeMode="contain"
        repeat={true}
        playInBackground={false}
        playWhenInactive={false}
        controls={false}
        paused={paused}

        // Adaptive Props
        selectedVideoTrack={{
          type: 'auto',
        }}
        maxBitrate={maxBitrate}
        {...currentConfig.props}

        // Events
        onLoad={onVideoLoad}
        onError={onVideoError}
        onProgress={onVideoProgress}
        onBandwidthUpdate={(data) => {
          // Optional: Log bandwidth for debugging
          // console.log('Bandwidth:', data.bitrate);
        }}

        allowsCrossProtocolRedirects={true}
      />

      {/* Debug Info (Optional - can be hidden in production) */}
      {/* <View style={{position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 5}}>
        <Text style={{color: 'white', fontSize: 10}}>Cfg: {currentConfig.name}</Text>
      </View> */}

      <TouchableWithoutFeedback onPress={onPress}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default VideoPlayer;

