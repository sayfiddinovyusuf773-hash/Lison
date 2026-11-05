/**
 * Helper to convert any YouTube URL format (watch, youtu.be, shorts, embed, or raw ID)
 * into a valid, safe iframe embed URL.
 */
export const formatYouTubeEmbedUrl = (rawUrl: string): string => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  const embedParams = 'playsinline=1&enablejsapi=1&rel=0&modestbranding=1';

  let videoId = '';

  // Already an embed url
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch && embedMatch[1]) {
    videoId = embedMatch[1];
  } else {
    // Standard: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch && watchMatch[1]) {
      videoId = watchMatch[1];
    } else {
      // Short link: https://youtu.be/VIDEO_ID
      const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      if (shortMatch && shortMatch[1]) {
        videoId = shortMatch[1];
      } else {
        // Shorts: https://www.youtube.com/shorts/VIDEO_ID
        const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
        if (shortsMatch && shortsMatch[1]) {
          videoId = shortsMatch[1];
        } else if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
          // Plain 11-char ID
          videoId = trimmed;
        }
      }
    }
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?${embedParams}`;
  }

  return trimmed;
};

/**
 * Extract YouTube thumbnail from URL
 */
export const getYouTubeThumbnail = (rawUrl: string): string | null => {
  if (!rawUrl) return null;
  const embed = formatYouTubeEmbedUrl(rawUrl);
  const match = embed.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return null;
};

/**
 * Extract canonical YouTube Watch URL for direct browser navigation
 */
export const getYouTubeWatchUrl = (rawUrl: string): string => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  const embed = formatYouTubeEmbedUrl(trimmed);
  const match = embed.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/watch?v=${match[1]}`;
  }
  return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
};

/**
 * Fetch video title & metadata automatically using public oEmbed
 */
export const fetchYouTubeMetadata = async (rawUrl: string): Promise<{ title?: string; author?: string; thumbnail?: string } | null> => {
  try {
    const watchUrl = getYouTubeWatchUrl(rawUrl);
    if (!watchUrl) return null;
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(watchUrl)}`);
    const data = await res.json();
    if (data && data.title) {
      return {
        title: data.title,
        author: data.author_name,
        thumbnail: data.thumbnail_url
      };
    }
    return null;
  } catch {
    return null;
  }
};
