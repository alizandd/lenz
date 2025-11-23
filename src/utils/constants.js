/**
 * Application-wide constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://hamsam.tvapps.ir/api/v1',
  TIMEOUT: 10000, // 10 seconds
};

// Video Player Configuration
export const VIDEO_CONFIG = {
  FADE_DURATION: 300, // milliseconds
  RETRY_ATTEMPTS: 3,
  BUFFER_CONFIG: {
    minBufferMs: 15000,
    maxBufferMs: 50000,
    bufferForPlaybackMs: 2500,
    bufferForPlaybackAfterRebufferMs: 5000,
  },
};

// UI Configuration
export const UI_CONFIG = {
  OVERLAY_HEIGHT_PERCENTAGE: 0.3, // 30% of screen height
  CHANNEL_ICON_SIZE: 80,
  CHANNEL_ITEM_SIZE: 100,
  CHANNEL_MARGIN: 10,
  FOCUS_BORDER_WIDTH: 3,
};

// Colors
export const COLORS = {
  PRIMARY: '#FFD700', // Gold
  BACKGROUND: '#000000', // Black
  OVERLAY: 'rgba(0, 0, 0, 0.7)',
  FOCUS_BORDER: '#FFFFFF', // White
  SELECTED_BORDER: '#FFD700', // Gold
  ERROR: '#FF6B6B',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#CCCCCC',
};

// Messages
export const MESSAGES = {
  LOADING: 'در حال بارگذاری...',
  ERROR_NETWORK: 'خطا در اتصال به اینترنت. لطفا اتصال خود را بررسی کنید.',
  ERROR_NO_CHANNELS: 'هیچ کانالی یافت نشد.',
  ERROR_VIDEO: 'خطا در پخش ویدیو. لطفا دوباره تلاش کنید.',
  RETRY: 'تلاش مجدد',
};




