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

const isTV = Platform.isTV;
const VISIBLE_ROWS = 6;
const ITEM_MARGIN = 10;

// TV Constants
const TV_ITEM_SIZE = 65;
const TV_COLUMNS = 12;

// Mobile Constants
const MIN_MOBILE_ITEM_WIDTH = 60; // Reduced to allow more items/smaller items

// Inline SVG for the app logo to avoid network/require issues on React Native
const lenzLogoXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg  viewBox="0 0 335 335" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="512px" height="512px">
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="lenz-logo-copy-3">
            <g id="Group" transform="translate(3.000000, 3.000000)">
                <path d="M245.946094,328.184723 L114.28402,328.184723 C51.882438,328.184723 0.826513905,277.12805 0.826513905,214.725242 L0.826513905,83.0615445 C0.826513905,37.8385022 37.8264444,0.837718489 83.0488227,0.837718489 L203.152293,0.837718489 C271.911262,0.837718489 328.168403,57.0959952 328.168403,125.855664 L328.168403,245.961207 C328.168403,291.18394 291.168472,328.184723 245.946094,328.184723" id="Fill-8" fill="#C4161C"></path>
                <path d="M65.5152981,72.8025984 L65.5152981,34.2441855 C65.5152981,33.9032187 65.7942668,33.6242459 66.1352286,33.6242459 L195.218702,33.6242459 C252.000924,33.6242459 298.458824,80.0828278 298.458824,136.865883 L298.458824,259.845777 C298.458824,260.186744 298.179855,260.465717 297.838893,260.465717 L262.577651,260.465717 L262.577651,295.464126 L130.820727,295.464126 C75.1680185,295.464126 29.6341251,254.109507 29.6341251,198.455981 L29.6341251,72.8025984 L65.5152981,72.8025984 Z M65.5152981,72.8025984 L65.5152981,187.681711 C65.5152981,227.713069 98.2674649,260.465717 138.298236,260.465717 L262.577651,260.465717 L262.577651,154.084736 C262.577651,109.379343 226.001133,72.8025984 181.296706,72.8025984 L65.5152981,72.8025984 Z" id="Combined-Shape" fill="#FED484"></path>
                <path d="M65.5152981,72.8025984 L29.6341251,72.8025984 L29.6341251,198.455981 C29.6341251,254.109507 75.1680185,295.464126 130.820727,295.464126 L262.577651,295.464126 L262.577651,260.465717 L138.298236,260.465717 C98.2674649,260.465717 65.5152981,227.713069 65.5152981,187.681711 L65.5152981,72.8025984 Z" id="Combined-Shape" fill="#FEAA0A"></path>
                <path d="M242.063934,241.116101 L153.847208,241.116101 C116.55777,241.116101 86.0482013,212.570673 86.0482013,175.280687 L86.0482013,91.1682153 C86.0482013,90.8272486 86.32717,90.5482758 86.6681318,90.5482758 L172.634511,90.5482758 C211.16164,90.5482758 242.683865,122.070963 242.683865,160.598658 L242.683865,240.496161 C242.683865,240.837128 242.404896,241.116101 242.063934,241.116101" id="Fill-14" fill="#FFFFFF"></path>
                <path d="M220.967514,164.891709 C220.967514,196.147202 195.630336,221.484753 164.375301,221.484753 C133.120266,221.484753 107.783088,196.147202 107.783088,164.891709 C107.783088,133.636215 133.120266,108.298665 164.375301,108.298665 C195.630336,108.298665 220.967514,133.636215 220.967514,164.891709" id="Fill-16" fill="#232E41"></path>
                <path d="M195.137057,164.422043 C195.137057,181.670931 181.154215,195.653979 163.90558,195.653979 C146.657254,195.653979 132.674412,181.670931 132.674412,164.422043 C132.674412,147.173154 146.657254,133.190107 163.90558,133.190107 C181.154215,133.190107 195.137057,147.173154 195.137057,164.422043" id="Fill-18" fill="#00152C"></path>
                <path d="M166.488768,187.200111 C166.488768,195.500172 159.760353,202.228996 151.460103,202.228996 C143.160164,202.228996 136.431439,195.500172 136.431439,187.200111 C136.431439,178.900049 143.160164,172.171225 151.460103,172.171225 C159.760353,172.171225 166.488768,178.900049 166.488768,187.200111" id="Fill-20" fill="#FFFFFF"></path>
                <path d="M183.395946,135.303667 C183.395946,139.58342 179.926505,143.052911 175.646815,143.052911 C171.367125,143.052911 167.897684,139.58342 167.897684,135.303667 C167.897684,131.023914 171.367125,127.554422 175.646815,127.554422 C179.926505,127.554422 183.395946,131.023914 183.395946,135.303667" id="Fill-22" fill="#FFFFFF"></path>
            </g>
        </g>
    </g>
</svg>`;

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
    const heightPercentage = isLandscape ? 0.35 : 0.40;
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

        // If hidden, any key just shows it and resets timer
        if (!isVisibleRef.current) {
          showContainer();
          scheduleHide(60000);
          return;
        }

        // If visible, reset timer
        showContainer();
        scheduleHide(60000);

        setPosition(prev => {
          let { x, y } = prev;
          const totalRows = Math.ceil(channels.length / itemsPerRow);
          const maxRow = Math.max(0, totalRows - 1);

          switch (event.keyCode) {
            case 19: // UP
              if (y > 0) {
                y -= 1;
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
              }
              break;
            case 22: // RIGHT
              if (x > 0) {
                x -= 1;
              }
              break;
            case 21: // LEFT
              if (x < itemsPerRow - 1 && getIndexFromRowCol(y, x + 1) < channels.length) {
                x += 1;
              }
              break;
            case 23: // DPAD_CENTER
            case 66: // ENTER
            case 160: // NUMPAD_ENTER
              {
                const index = getIndexFromRowCol(y, x);
                if (index >= 0 && index < channels.length) {
                  const selected = channels[index];
                  onChannelSelect(selected);
                  // Hide list after selection (keep default short delay or immediate)
                  scheduleHide(500);
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
  }, [channels.length, paused, itemsPerRow]);

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
        marginTop: 8,
        marginBottom: 3,
        marginLeft: 35,
      }}>
        <SvgXml
          width={30}
          height={30}
          xml={lenzLogoXml}
        />
        <Text style={{
          fontSize: 20,
          color: '#fff',
          marginRight: 8,
          marginLeft: 8,
          marginTop: 2,
          fontFamily: 'IRANSans-Medium', // If not available, fallback to default
        }}>
          لنز
        </Text>
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
    borderColor: '#3b3939',
    // shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
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
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    elevation: 15,
    borderWidth: 2,
  },
  channelItemSelected: {
    borderColor: '#FF6B00',
    backgroundColor: 'rgba(255, 107, 0, 0.25)',
    borderWidth: 2,
  },
  channelIcon: {
    // width and height are now dynamic
  },
});

export default ChannelList;
