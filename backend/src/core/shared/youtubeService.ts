export interface YoutubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  channelTitle: string;
}

export async function searchYoutubeVideos(query: string, limit: number = 3): Promise<YoutubeVideo[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const YoutubeSearchApi = require('youtube-search-api');
    const result = await YoutubeSearchApi.GetListByKeyword(query, false, limit + 5);

    if (!result || !result.items) return [];

    return result.items
      .filter((item: any) => item.type === 'video' && item.id)
      .slice(0, limit)
      .map((item: any) => ({
        id: item.id,
        title: item.title,
        url: `https://www.youtube.com/watch?v=${item.id}`,
        thumbnail: item.thumbnail?.thumbnails?.[0]?.url || '',
        channelTitle: item.channelTitle || '',
      }));
  } catch (error) {
    console.error('Failed to fetch YouTube videos:', error);
    return [];
  }
}
