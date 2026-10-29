// src/api/youtube.js

/**
 * Dynamically fetches the top matching YouTube video ID for an exercise name.
 * @param {string} exerciseName 
 * @returns {Promise<string|null>} - YouTube video ID or null
 */
export async function fetchYouTubeVideoId(exerciseName) {
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!API_KEY || API_KEY === 'your_actual_youtube_api_key_here') {
    console.warn("VITE_YOUTUBE_API_KEY is not configured in your .env file.");
    return null;
  }

  try {
    const query = encodeURIComponent(`${exerciseName} exercise form tutorial`);
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items[0].id.videoId;
    }
    
    return null;
  } catch (error) {
    console.error("Failed to fetch YouTube video dynamically:", error);
    return null;
  }
}