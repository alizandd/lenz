import {useState, useEffect, useCallback} from 'react';
import {fetchChannels} from '../services/api';
import {MESSAGES} from '../utils/constants';

/**
 * Custom hook for managing channel data
 * @returns {Object} Channel state and functions
 */
const useChannels = () => {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load channels from API
   */
  const loadChannels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const channelData = await fetchChannels();

      if (channelData && channelData.length > 0) {
        setChannels(channelData);
        // Auto-select first channel
        setSelectedChannel(channelData[0]);
      } else {
        setError(MESSAGES.ERROR_NO_CHANNELS);
      }
    } catch (err) {
      console.error('Failed to load channels:', err);
      setError(MESSAGES.ERROR_NETWORK);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Select a channel
   * @param {Object} channel - Channel object to select
   */
  const selectChannel = useCallback((channel) => {
    if (channel && channel.link) {
      setSelectedChannel(channel);
    }
  }, []);

  /**
   * Reload channels
   */
  const reloadChannels = useCallback(() => {
    loadChannels();
  }, [loadChannels]);

  // Load channels on mount
  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  return {
    channels,
    selectedChannel,
    loading,
    error,
    selectChannel,
    reloadChannels,
  };
};

export default useChannels;







