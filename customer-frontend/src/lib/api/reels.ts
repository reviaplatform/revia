import { apiClient, BACKEND_URL } from './client';
import { Reel, ApiResponse } from './types';

const normalizeReels = (data: any): Reel[] => {
  let reels: any[] = [];
  
  if (Array.isArray(data)) {
    reels = data;
  } else if (data && typeof data === 'object') {
    reels = data.data || data.reels || data.items || data.results || data.result || [];
  }

  const normalized = reels.map((r: any) => {
    // Handle potential array of videos/thumbnails
    const getFirst = (val: any) => Array.isArray(val) ? val[0] : val;
    
    const ensureAbsolute = (url: string) => {
      if (!url) return '';
      if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
      // Prepend BACKEND_URL for relative paths
      return `${BACKEND_URL}/${url.replace(/^\//, '')}`;
    };

    const brandName = r.brand?.name;
    const creatorName =
      r.creatorName || r.creator || r.author || r.username ||
      (brandName
        ? typeof brandName === 'string' ? brandName : (brandName.en || brandName.ar || '')
        : '');

    return {
      ...r,
      id: r.id || r._id || String(Math.random()),
      // API uses "caption" for the localized title; fall back to title/name fields
      title: r.caption || r.title || r.name || r.heading || 'Untitled Reel',
      description: r.description || r.text || '',
      creatorName,
      videoUrl: ensureAbsolute(getFirst(r.videoUrl || r.video || r.video_url || r.video_src || r.videos || '')),
      thumbnailUrl: ensureAbsolute(getFirst(r.thumbnailUrl || r.thumbnail || r.thumbnail_url || r.thumbnail_src || r.cover || r.poster || r.thumbnails || '')),
      likesCount: r.likesCount ?? r.likes_count ?? r.likes ?? 0,
      viewsCount: r.viewsCount ?? r.views_count ?? r.views ?? 0,
      isLiked: !!(r.isLiked ?? r.is_liked ?? false),
    };
  });

  return normalized;
};

export const getReels = async (page: number = 1, limit: number = 10): Promise<Reel[]> => {
  const response = await apiClient.get<any>('reel', {
    params: { page, limit }
  });
  return normalizeReels(response.data);
};

/**
 * Fetches all reels in a single request using a very large limit.
 * The API returns a flat Reel[] — no pagination wrapper.
 */
export const getAllReels = async (): Promise<Reel[]> => {
  const response = await apiClient.get<any>('reel', {
    params: { limit: 10000 }
  });
  return normalizeReels(response.data);
};

export const likeReel = async (id: string): Promise<{ isLiked: boolean, likesCount: number }> => {
  const response = await apiClient.post<ApiResponse<{ isLiked: boolean, likesCount: number }>>(`reel/${id}/like`);
  return response.data.data;
};

export const viewReel = async (id: string): Promise<void> => {
  await apiClient.post(`reel/${id}/view`);
};
