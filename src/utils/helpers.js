/**
 * Helper utility functions
 */

/**
 * Format timestamp to readable date
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted date string
 */
import { Shamsi } from 'basic-shamsi';

/**
 * Convert English digits to Persian digits
 * @param {string} str - String with English digits
 * @returns {string} String with Persian digits
 */
const toPersianDigits = (str) => {
  if (!str) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.toString().replace(/\d/g, (d) => persianDigits[d]);
};

/**
 * Format timestamp to readable date
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  try {
    const date = new Date(timestamp);
    const formatted = Shamsi.format('yyyy/MM/dd', date);
    return toPersianDigits(formatted);
  } catch (error) {
    return timestamp;
  }
};

/**
 * Format timestamp to readable date and time
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted date time string
 */
export const formatDateTime = (timestamp) => {
  try {
    const date = new Date(timestamp);
    const formatted = Shamsi.format('yyyy/MM/dd ساعت HH:mm', date);
    return toPersianDigits(formatted);
  } catch (error) {
    return timestamp;
  }
};

/**
 * Check if a URL is valid
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Check if device is Android TV
 * @returns {boolean} True if running on Android TV
 */
export const isAndroidTV = () => {
  const { Platform } = require('react-native');
  return Platform.isTV;
};

/**
 * Debounce function to limit execution frequency
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Filter active channels
 * @param {Array} channels - Array of channel objects
 * @returns {Array} Filtered array of active channels
 */
export const getActiveChannels = (channels) => {
  return channels.filter((channel) => channel.link && channel.icon);
};

/**
 * Sort channels by priority or name
 * @param {Array} channels - Array of channel objects
 * @returns {Array} Sorted array
 */
export const sortChannels = (channels) => {
  return [...channels].sort((a, b) => {
    // Sort by status first (active channels first)
    if (a.status !== b.status) {
      return b.status - a.status;
    }
    // Then sort by title
    return a.title.localeCompare(b.title, 'fa');
  });
};



