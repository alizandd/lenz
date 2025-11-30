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
const VideoPlayer = ({ streamUrl, onError, onPress, paused = false }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const videoRef = useRef(null);
  const previousUrl = useRef(streamUrl);
  const retryRef = useRef(0);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Only animate if the stream URL changes
    if (previousUrl.current !== streamUrl) {
      retryRef.current = 0; // reset retry counter on url change
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Update the previous URL reference
        previousUrl.current = streamUrl;

        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [streamUrl, fadeAnim]);

  /**
   * Handle video playback errors
   */
  const handleError = (error) => {
    console.error('Video playback error:', error);
    // Retry a couple of times as some TV firmwares need a reconnect
    if (retryRef.current < 2) {
      retryRef.current += 1;
      setTimeout(() => {
        setReloadKey(k => k + 1); // force re-mount to restart the player
      }, 800);
      return;
    }
    onError?.(error);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Video
        key={`${reloadKey}-${streamUrl}`} // force re-mount on retries/changes
        ref={videoRef}
        source={{
          uri: streamUrl,
          headers: {
            // Some CDNs require a UA to deliver HLS segments on TVs
            'Referer': 'https://www.aparat.com/',
            'Accept': '*/*',
          },
        }}
        style={styles.video}
        resizeMode="contain"
        repeat={true}
        playInBackground={false}
        playWhenInactive={false}
        onError={handleError}
        controls={false}
        paused={paused}
        // HLS specific configurations
        useTextureView={true}
        isLive={false}
        // type="m3u8" // uncomment if certain TVs mis-detect HLS
        bufferConfig={{
          minBufferMs: 15000,
          maxBufferMs: 50000,
          bufferForPlaybackMs: 2500,
          bufferForPlaybackAfterRebufferMs: 5000,
        }}
        allowsCrossProtocolRedirects={true}
      />
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

