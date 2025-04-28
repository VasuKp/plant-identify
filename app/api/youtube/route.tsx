import { NextResponse } from 'next/server';

const LANGUAGE_CONFIG = {
  en: {
    keywords: ['complete guide', 'care guide', 'how to grow', 'plant care', 'gardening tips'],
    searchTerms: 'plant complete care guide growing tips maintenance tutorial',
    regionCode: 'US',
    fallback: ['en'],
    minDuration: 'medium'
  },
  hi: {
    keywords: [
      'पूर्ण गाइड', 'देखभाल गाइड', 'कैसे उगाएं', 'पौधों की देखभाल',
      'बागवानी टिप्स', 'गार्डनिंग गाइड', 'पौधा देखभाल'
    ],
    searchTerms: 'पौधा देखभाल गाइड पूर्ण जानकारी बागवानी टिप्स',
    regionCode: 'IN',
    fallback: ['hi', 'en'],
    minDuration: 'medium'
  },
  gu: {
    keywords: [
      'સંપૂર્ણ માર્ગદર્શિકા', 'સંભાળ માર્ગદર્શિકા', 'કેવી રીતે ઉગાડવું', 
      'છોડની સંભાળ', 'બાગકામ માર્ગદર્શન', 'ગાર્ડનિંગ ટિપ્સ'
    ],
    searchTerms: 'છોડ સંભાળ માર્ગદર્શિકા પૂર્ણ માહિતી',
    regionCode: 'IN',
    fallback: ['gu', 'hi', 'en'],
    minDuration: 'medium'
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const lang = (searchParams.get('lang') || 'en') as keyof typeof LANGUAGE_CONFIG;

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const config = LANGUAGE_CONFIG[lang] || LANGUAGE_CONFIG.en;
  let languageAttempts = [];

  try {
    // First try Gujarati
    if (lang === 'gu') {
      const guVideo = await searchVideoInLanguage(query, 'gu');
      if (guVideo) {
        return NextResponse.json({ ...guVideo, language: 'gu' });
      }
      languageAttempts.push('gu');

      // If no Gujarati video, try Hindi
      const hiVideo = await searchVideoInLanguage(query, 'hi');
      if (hiVideo) {
        return NextResponse.json({ ...hiVideo, language: 'hi' });
      }
      languageAttempts.push('hi');
    }

    // Finally, try English as fallback
    const enVideo = await searchVideoInLanguage(query, 'en');
    if (enVideo) {
      return NextResponse.json({ ...enVideo, language: 'en' });
    }
    languageAttempts.push('en');

    return NextResponse.json({ 
      error: 'No suitable videos found',
      searchedLanguages: languageAttempts 
    }, { status: 404 });

  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function searchVideoInLanguage(query: string, language: keyof typeof LANGUAGE_CONFIG) {
  const config = LANGUAGE_CONFIG[language];
  const searchQuery = `${query} ${config.searchTerms}`;

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?` +
    `part=snippet&q=${encodeURIComponent(searchQuery)}` +
    `&type=video&maxResults=10` +
    `&videoDuration=${config.minDuration}` +
    `&relevanceLanguage=${language}` +
    `&regionCode=${config.regionCode}` +
    `&key=${process.env.YOUTUBE_API_KEY}`
  );

  if (!response.ok) return null;

  const data = await response.json();
  if (!data.items?.length) return null;

  const videos = data.items.map(item => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnails: item.snippet.thumbnails,
    publishedAt: item.snippet.publishedAt,
    channelTitle: item.snippet.channelTitle
  }));

  return findBestVideo(videos, config.keywords);
}

function findBestVideo(videos: any[], keywords: string[]) {
  const scoredVideos = videos.map(video => {
    let score = 0;
    const titleLower = video.title.toLowerCase();
    const descriptionLower = video.description.toLowerCase();

    // Keyword matching
    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      if (titleLower.includes(keywordLower)) score += 3;
      if (descriptionLower.includes(keywordLower)) score += 1;
    });

    // Content quality indicators
    if (titleLower.includes('complete') || titleLower.includes('full')) score += 2;
    if (video.title.length > 50) score += 1;
    if (video.description.length > 100) score += 1;

    // Recency
    const videoAge = new Date().getFullYear() - new Date(video.publishedAt).getFullYear();
    if (videoAge <= 2) score += 2;

    // Quality
    if (video.thumbnails?.maxres) score += 1;

    return { ...video, score };
  });

  return scoredVideos.sort((a, b) => b.score - a.score)[0];
}