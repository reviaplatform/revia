export interface IfixitGuide {
  guideid: number;
  title: string;
  summary: string;
  url: string;
  difficulty: string;
  image?: {
    thumbnail: string;
    standard: string;
  };
}

export async function searchIfixitGuides(query: string): Promise<IfixitGuide[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`https://www.ifixit.com/api/2.0/suggest/${encodedQuery}`);

    if (!response.ok) {
      console.error(`iFixit API Error: ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (data && data.results && Array.isArray(data.results)) {
      return data.results
        .filter((item: any) => item.dataType === 'guide')
        .slice(0, 3)
        .map((item: any) => ({
          guideid: item.guideid,
          title: item.title,
          summary: item.summary,
          url: item.url,
          difficulty: item.difficulty,
          image: item.image
            ? { thumbnail: item.image.thumbnail, standard: item.image.standard }
            : undefined,
        }));
    }

    return [];
  } catch (error) {
    console.error('Failed to fetch iFixit guides:', error);
    return [];
  }
}
