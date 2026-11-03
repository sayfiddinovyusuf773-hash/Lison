/**
 * Helper to convert any YouTube URL format (watch, youtu.be, shorts, embed, or raw ID)
 * into a valid, safe iframe embed URL.
 */
export const formatYouTubeEmbedUrl = (rawUrl: string): string => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();

  // Already an embed url
  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed;
  }

  // Standard: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  // Short link: https://youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  // Shorts: https://www.youtube.com/shorts/VIDEO_ID
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  // Plain 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/embed/${trimmed}`;
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
