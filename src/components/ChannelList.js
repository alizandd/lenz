import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  DeviceEventEmitter,
  Text,
  Animated,
  Easing,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SvgUri, SvgXml } from 'react-native-svg';
import { isChannelAvailable } from '../utils/helpers';

const isTV = Platform.isTV;
const VISIBLE_ROWS = 6;
const ITEM_MARGIN = 10;

// TV Constants
const TV_ITEM_SIZE = 65;
const TV_COLUMNS = 12;

// Mobile Constants
const MIN_MOBILE_ITEM_WIDTH = 60; // Reduced to allow more items/smaller items

// Inline SVG for the app logo to avoid network/require issues on React Native
const lenzLogo = require('../public/SAMTV.png');

/**
 * ChannelList Component
 * Displays a vertical scrollable grid of TV channels (15 per row)
 * Supports both touch and TV remote D-pad navigation (up/down/left/right)
 *
 * @param {Array} channels - Array of channel objects
 * @param {number} selectedChannelId - Currently selected channel ID
 * @param {Function} onChannelSelect - Callback when a channel is selected
 */
const ChannelList = forwardRef(({ channels, selectedChannelId, onChannelSelect, paused }, ref) => {
  const { width, height } = useWindowDimensions();
  const [position, setPosition] = useState({ x: 0, y: 0 }); // x = col, y = row
  const [isVisible, setIsVisible] = useState(true);

  const scrollViewRef = useRef(null);
  const hideTimerRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current; // 0 = visible, >0 = hidden (translated down)
  const isVisibleRef = useRef(true);
  const onChannelSelectRef = useRef(onChannelSelect);

  useEffect(() => {
    onChannelSelectRef.current = onChannelSelect;
  }, [onChannelSelect]);

  // Sync focus position with selected channel
  useEffect(() => {
    if (selectedChannelId && channels.length > 0) {
      const index = channels.findIndex(c => c.id === selectedChannelId);
      if (index !== -1) {
        const { row, col } = getRowCol(index);
        setPosition({ x: col, y: row });
      }
    }
  }, [selectedChannelId, channels, itemsPerRow]);

  // Dynamic calculations based on current window dimensions
  const {
    itemsPerRow,
    itemSize,
    containerHeight
  } = useMemo(() => {
    const isLandscape = width > height;

    // Calculate container height
    // In landscape, we want it smaller relative to screen height to avoid taking up too much space
    // In portrait, 40% is fine. In landscape, we reduce it to 35%
    const heightPercentage = isLandscape ? 0.40 : 0.40;
    const calculatedHeight = height * heightPercentage;

    // Calculate grid layout
    let cols, size;
    if (isTV) {
      cols = TV_COLUMNS;
      size = TV_ITEM_SIZE;
    } else {
      const availableWidth = width - 60; // 30px padding horizontal
      const mobileColumns = Math.floor(availableWidth / (MIN_MOBILE_ITEM_WIDTH + ITEM_MARGIN));
      const finalMobileColumns = Math.max(4, mobileColumns);
      const mobileItemWidth = (availableWidth / finalMobileColumns) - ITEM_MARGIN;

      cols = finalMobileColumns;
      size = mobileItemWidth;
    }

    return {
      itemsPerRow: cols,
      itemSize: size,
      containerHeight: calculatedHeight
    };
  }, [width, height]);

  const showContainer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    setIsVisible(true);
    isVisibleRef.current = true;
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const hideContainer = () => {
    setIsVisible(false);
    isVisibleRef.current = false;
    Animated.timing(slideAnim, {
      toValue: containerHeight, // Use dynamic height for full hiding
      duration: 250,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  // Update slideAnim when containerHeight changes to ensure it stays hidden or visible correctly
  // This fixes the issue where rotating the device might leave the list partially visible if it was hidden
  useEffect(() => {
    if (!isVisibleRef.current) {
      // If currently hidden, update the translation to the new height immediately
      slideAnim.setValue(containerHeight);
    }
  }, [containerHeight, slideAnim]);

  const scheduleHide = (duration = 5000) => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      hideContainer();
    }, duration);
  };

  useImperativeHandle(ref, () => ({
    show: () => {
      showContainer();
      scheduleHide(60000);
    },
    hide: () => {
      hideContainer();
    },
    toggle: () => {
      if (isVisibleRef.current) {
        hideContainer();
      } else {
        showContainer();
        scheduleHide(60000);
      }
    },
    isVisible: () => isVisibleRef.current,
  }));

  /**
   * Get row and column for a given index
   */
  const getRowCol = (index) => {
    const row = Math.floor(index / itemsPerRow);
    const col = index % itemsPerRow;
    return { row, col };
  };

  /**
   * Get index from row and column
   */
  const getIndexFromRowCol = (row, col) => {
    return row * itemsPerRow + col;
  };

  /**
   * Listen to native Android key events and update position (x,y)
   * Only position determines which item is "hovered" / focused.
   */
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'AndroidKeyEvent',
      (event) => {
        if (paused) return;
        if (event.action !== 0) return; // Only handle key down
        if (event.keyCode === 4) return; // Ignore Back button

        // Ignore Volume keys (24: VOLUME_UP, 25: VOLUME_DOWN)
        if (event.keyCode === 24 || event.keyCode === 25) return;

        const isChannelKey = event.keyCode === 166 || event.keyCode === 167;

        // If hidden, any key just shows it and resets timer
        // EXCEPTION: Channel keys should work without showing the list
        if (!isVisibleRef.current && !isChannelKey) {
          showContainer();
          scheduleHide(60000);
          return;
        }

        // If visible, reset timer
        if (isVisibleRef.current) {
          showContainer();
          scheduleHide(60000);
        }
        // Handle Channel Keys (166: CH_UP, 167: CH_DOWN)
        if (isChannelKey) {
          const currentIndex = channels.findIndex(c => c.id === selectedChannelId);
          let newIndex = currentIndex;
          let attempts = 0;
          const maxAttempts = channels.length;

          // Loop to find next AVAILABLE channel
          do {
            if (event.keyCode === 166) { // CH_UP
              newIndex = newIndex + 1;
              if (newIndex >= channels.length) newIndex = 0; // Loop to start
            } else if (event.keyCode === 167) { // CH_DOWN
              newIndex = newIndex - 1;
              if (newIndex < 0) newIndex = channels.length - 1; // Loop to end
            }
            attempts++;
          } while (!isChannelAvailable(channels[newIndex]) && attempts < maxAttempts);

          // If we found an available channel (or looped back to start if all unavailable)
          if (newIndex >= 0 && newIndex < channels.length && isChannelAvailable(channels[newIndex])) {
            const newChannel = channels[newIndex];
            if (onChannelSelectRef.current) {
              onChannelSelectRef.current(newChannel);
            }
          }
          return;
        }

        setPosition(prev => {
          let { x, y } = prev;
          const totalRows = Math.ceil(channels.length / itemsPerRow);
          const maxRow = Math.max(0, totalRows - 1);

          switch (event.keyCode) {
            case 19: // UP
              if (y > 0) {
                y -= 1;
                handeleChannelSelect(y, x);
              }

              break;
            case 20: // DOWN
              if (y < maxRow) {
                const proposedRow = y + 1;
                const proposedIndex = getIndexFromRowCol(proposedRow, x);
                if (proposedIndex >= channels.length) {
                  const lastIndex = channels.length - 1;
                  y = Math.floor(lastIndex / itemsPerRow);
                  x = lastIndex % itemsPerRow;
                } else {
                  y = proposedRow;
                }
                handeleChannelSelect(y, x);
              }

              break;
            case 22: // RIGHT
              if (x > 0) {
                x -= 1;
                handeleChannelSelect(y, x);
              }

              break;
            case 21: // LEFT
              if (x < itemsPerRow - 1 && getIndexFromRowCol(y, x + 1) < channels.length) {
                x += 1;
                handeleChannelSelect(y, x);
              }

              break;
            case 23: // DPAD_CENTER
            case 66: // ENTER
            case 160: // NUMPAD_ENTER
              {
                const index = getIndexFromRowCol(y, x);
                if (index >= 0 && index < channels.length) {
                  const selected = channels[index];
                  if (onChannelSelectRef.current) {
                    onChannelSelectRef.current(selected);
                  }
                  // Hide list after selection (keep default short delay or immediate)
                  scheduleHide(800);
                }
              }
              break;
          }

          return { x, y };
        });
      },
    );

    // Initial hide timer when component mounts or channels change
    scheduleHide(60000);

    return () => {
      subscription.remove();
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [channels, paused, itemsPerRow, selectedChannelId]);

  /**
   * Scroll so that the given row stays within a window of VISIBLE_ROWS
   */
  const scrollToRow = (row) => {
    const totalRows = Math.ceil(channels.length / itemsPerRow);
    const maxFirstRow = Math.max(0, totalRows - VISIBLE_ROWS);

    // سعی می‌کنیم ردیف فوکوس وسط پنجره باشد
    let firstVisibleRow = row - Math.floor(VISIBLE_ROWS / 2);
    if (firstVisibleRow < 0) {
      firstVisibleRow = 0;
    } else if (firstVisibleRow > maxFirstRow) {
      firstVisibleRow = maxFirstRow;
    }

    const itemHeight = itemSize + ITEM_MARGIN;
    const offset = firstVisibleRow * itemHeight;

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: offset, animated: true });
    }
  };

  const handeleChannelSelect = (y, x) => {
    const index = getIndexFromRowCol(y, x);
    if (index >= 0 && index < channels.length) {
      const selected = channels[index];
      if (onChannelSelectRef.current) {
        onChannelSelectRef.current(selected);
      }
      // Hide list after selection (keep default short delay or immediate)
      //scheduleHide(800);
    }
  };
  /**
   * Handle channel selection via touch
   * @param {Object} channel - Selected channel object
   * @param {number} index - Channel index
   */
  const handleChannelPress = (channel, index) => {
    const { row, col } = getRowCol(index);
    setPosition({ x: col, y: row });
    showContainer();
    onChannelSelect(channel);
    scheduleHide();
  };

  // keep scroll position in sync with focused item (based on x,y)
  // Scroll exactly one row height when y > 1
  useEffect(() => {
    const itemHeight = itemSize + ITEM_MARGIN;
    const row = position.y;
    if (scrollViewRef.current) {
      const offset = row > 1 ? (row - 1) * itemHeight : 0;
      scrollViewRef.current.scrollTo({ y: offset, animated: true });
    }
  }, [position.y, channels.length, itemSize]);

  // Removed bounce animation for faster navigation feel

  return (
    <Animated.View style={[styles.container, {
      height: containerHeight,
      transform: [{ translateY: slideAnim }]
    }]}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: 0,
        marginBottom: 3,
        marginLeft: 38,
      }}>
        <Image
          source={lenzLogo}
          style={{ width: 64, height: 40 }}

        />
        {/* <Text style={{
          fontSize: 20,
          color: '#fff',
          marginRight: 8,
          marginLeft: 8,
          marginTop: 2,
          fontFamily: 'IRANSans-Medium', // If not available, fallback to default
        }}>
          لنز
        </Text> */}
      </View>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        decelerationRate="fast"
        focusable={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.gridContainer}>
          {channels.map((channel, index) => {
            const isSelected = channel.id === selectedChannelId;
            const focusedIndex = getIndexFromRowCol(position.y, position.x);
            const isFocused = index === focusedIndex;

            const isSvg = typeof channel.icon === 'string'
              && channel.icon.toLowerCase().endsWith('.svg');
            const scale = isFocused ? 1.05 : 1;

            return (
              <TouchableOpacity
                key={channel.id}
                style={[
                  styles.channelItem,
                  { width: itemSize, height: itemSize }, // Dynamic size
                  isFocused && styles.channelItemFocused,
                  { transform: [{ scale }] },
                ]}
                onPress={() => handleChannelPress(channel, index)}
                activeOpacity={0.7}>
                <View style={[styles.itemInner, { width: itemSize - 20, height: itemSize - 20 }]}>
                  {isSvg ? (
                    <SvgUri
                      uri={channel.icon}
                      width={isTV ? itemSize - 30 : itemSize - 20}
                      height={isTV ? itemSize - 30 : itemSize - 20}
                    />
                  ) : (
                    <Image
                      source={{ uri: channel.icon }}
                      style={[styles.channelIcon, { width: itemSize - 30, height: itemSize - 30 }]}
                      resizeMode="contain"
                    />
                  )}
                  <Text style={styles.channelTitle} numberOfLines={1} ellipsizeMode="tail">
                    {channel.title}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // height is now dynamic via inline style
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  channelItem: {
    // width and height are now dynamic
    marginLeft: ITEM_MARGIN,
    marginBottom: ITEM_MARGIN,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    // shadow for depth

  },
  itemInner: {
    // width and height are now dynamic
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelTitle: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 2,
    width: '100%',
  },
  channelItemFocused: {
    borderColor: '#0099ffff',
    backgroundColor: 'rgba(0, 183, 255, 0.3)',
    elevation: 15,
    borderWidth: 2,
  },
  channelItemSelected: {
    borderColor: '#0099ffff',
    backgroundColor: 'rgba(0, 183, 255, 0.3)',
    borderWidth: 2,
  },
  channelIcon: {
    // width and height are now dynamic
  },
});

export default ChannelList;
