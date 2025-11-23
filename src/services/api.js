import axios from 'axios';

// API base URL for fetching live TV channels
const API_BASE_URL = 'https://hamsam.tvapps.ir/api/v1';

/**
 * Fetches the list of live TV channels from the API
 * @returns {Promise<Array>} Array of channel objects
 * @throws {Error} If the API request fails
 */
export const fetchChannels = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/lives`);
    
    // Check if the response is successful
    if (response.data && response.data.status === 'success') {
      return response.data.data || [];
    }
    
    throw new Error('Failed to fetch channels');
  } catch (error) {
    console.error('Error fetching channels:', error);
    throw error;
  }
};

/**
 * Channel object structure:
 * {
 *   id: number,
 *   title: string,
 *   icon: string (URL),
 *   image: string (URL),
 *   link: string (HLS stream URL),
 *   description: string,
 *   status: boolean,
 *   start: string (timestamp),
 *   end: string (timestamp)
 * }
 */




