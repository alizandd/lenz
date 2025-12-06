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
    const response = await axios.get(`${API_BASE_URL}/lives?is_external=1`);

    // Check if the response is successful
    if (response.data && response.data.status === 'success') {
      const channels = response.data.data || [];

      // Process channels to resolve external links
      const processedChannels = await Promise.all(channels.map(async (channel) => {
        if (channel.is_external && channel.external_detail) {
          try {
            return await resolveExternalLink(channel);
          } catch (err) {
            console.warn(`Failed to resolve external link for channel ${channel.id}:`, err);
            // Return channel as is or maybe mark as unavailable? 
            // For now, returning as is, but the link might be invalid if it depended on resolution.
            return channel;
          }
        }
        return channel;
      }));

      return processedChannels;
    }

    throw new Error('Failed to fetch channels');
  } catch (error) {
    console.error('Error fetching channels:', error);
    throw error;
  }
};

/**
 * Resolves the actual video link for external channels
 * @param {Object} channel 
 * @returns {Promise<Object>} Updated channel object with resolved link
 */
const resolveExternalLink = async (channel) => {
  const { link, HTTP_Method, node } = channel.external_detail;

  if (!link || !HTTP_Method) {
    return channel;
  }

  try {
    const response = await axios({
      method: HTTP_Method,
      url: link,
    });

    // Navigate through the response data using the 'node' path
    // Node can be a simple key like "hls" or a path like "data.hls" (though user said "node" value)
    // Based on user request: "response ro bekhone va node "node" ro bekhone va vlue ro az service be dast biare"
    // Assuming 'node' is a key in the response body.

    let videoLink = null;
    if (node && response.data) {
      // Handle nested nodes if necessary (e.g. "data.hls")
      videoLink = node.split('.').reduce((obj, key) => obj && obj[key], response.data);
    }

    if (videoLink) {
      console.log(`Resolved external link for ${channel.title}:`, videoLink);
      return {
        ...channel,
        link: videoLink
      };
    }
  } catch (error) {
    console.error(`Error resolving external link for channel ${channel.id}:`, error);
  }

  return channel;
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







