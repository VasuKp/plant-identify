'use client'

import { useState, useRef } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { useLanguage } from '../context/languagecontext'
import ImageUpload from '../components/ImageUpload'
import PlantInfo from '../components/PlantInfo'
import Footer from '../components/Footer'
import Navbar from '../components/Navigation'

interface YouTubeVideo {
  id: string;
  title: string;
  language: string;
  channelTitle?: string;
  thumbnails?: any;
}

interface PlantInfo {
  description: string;
  commonName: string;
  scientificName: string;
  careInstructions: string;
  idealConditions: string;
}

const languageConfig = {
  en: {
    code: 'en',
    name: 'English',
    script: null,
    videoKeywords: ['complete guide', 'care guide', 'how to grow', 'plant care']
  },
  gu: {
    code: 'gu',
    name: 'ગુજરાતી',
    script: /[\u0A80-\u0AFF]/,
    example: 'ગુજરાતી',
    videoKeywords: ['સંપૂર્ણ માર્ગદર્શિકા', 'સંભાળ માર્ગદર્શિકા', 'કેવી રીતે ઉગાડવું', 'છોડની સંભાળ']
  },
  hi: {
    code: 'hi',
    name: 'हिंदी',
    script: /[\u0900-\u097F]/,
    example: 'हिंदी',
    videoKeywords: ['पूर्ण गाइड', 'देखभाल गाइड', 'कैसे उगाएं', 'पौधों की देखभाल']
  }
};

export default function Home() {
  const { translations, locale } = useLanguage();
  const [plantData, setPlantData] = useState<PlantInfo | null>(null);
  const [videoData, setVideoData] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadCardClick = () => {
    fileInputRef.current?.click();
  };

  const fetchYouTubeVideo = async (plantName: string) => {
    setVideoLoading(true);
    try {
      const searchQuery = `${plantName}`;
      const response = await fetch(`/api/youtube?q=${encodeURIComponent(searchQuery)}&lang=${locale}`);
      const data = await response.json();
      
      if (data.videoId) {
        setVideoData({
          id: data.videoId,
          title: data.title,
          language: data.language,
          channelTitle: data.channelTitle,
          thumbnails: data.thumbnails
        });
      } else if (data.error) {
        console.warn('Video fetch warning:', data.error, data.searchedLanguages);
        // Try fetching in English if preferred language video not found
        if (locale !== 'en') {
          const fallbackResponse = await fetch(`/api/youtube?q=${encodeURIComponent(searchQuery)}&lang=en`);
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.videoId) {
            setVideoData({
              id: fallbackData.videoId,
              title: fallbackData.title,
              language: 'en',
              channelTitle: fallbackData.channelTitle,
              thumbnails: fallbackData.thumbnails
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching YouTube video:', error);
    } finally {
      setVideoLoading(false);
    }
  };

  const parseResponse = (text: string): PlantInfo => {
    const cleanText = (str: string) => {
      return str
        .replace(/^[-*•]/gm, '')
        .replace(/\s+/g, ' ')
        .replace(/^\s+|\s+$/g, '')
        .trim();
    };

    const extractSection = (content: string, startMarker: string, endMarker: string) => {
      try {
        const startIndex = content.indexOf(startMarker);
        if (startIndex === -1) return '';

        const searchFrom = startIndex + startMarker.length;
        const endIndex = endMarker ? content.indexOf(endMarker, searchFrom) : content.length;
        const extracted = content.slice(searchFrom, endIndex === -1 ? undefined : endIndex);
        return cleanText(extracted);
      } catch {
        return '';
      }
    };

    const description = extractSection(text, 'Description:', 'Plant Details:');
    const detailsSection = text.slice(text.indexOf('Plant Details:'));
    const commonName = extractSection(detailsSection, 'Common Name:', 'Scientific Name:');
    const scientificName = extractSection(detailsSection, 'Scientific Name:', 'Care Instructions:');
    const careInstructions = extractSection(detailsSection, 'Care Instructions:', 'Ideal Conditions:');
    const idealConditions = extractSection(detailsSection, 'Ideal Conditions:', '\n\n');

    return {
      description: description || 'Description not available',
      commonName: commonName || 'Name not available',
      scientificName: scientificName || 'Scientific name not available',
      careInstructions: careInstructions || 'Care instructions not available',
      idealConditions: idealConditions || 'Ideal conditions not available'
    };
  };

  const identifyPlant = async (imageBase64: string) => {
    setLoading(true);
    setError(null);
    setVideoData(null);

    try {
      if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
        throw new Error(translations.errors?.apiKeyMissing || 'Google API key is not configured');
      }

      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const base64Data = imageBase64.split(',')[1];
      if (!base64Data) {
        throw new Error(translations.errors?.invalidImage || 'Invalid image format');
      }

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg'
        }
      };

      const currentLang = languageConfig[locale as keyof typeof languageConfig];

      const prompt = `You are a plant identification expert. Analyze this plant image and provide information in ${currentLang.name} language.
      
      IMPORTANT: You MUST respond in ${currentLang.name} language only.
      ${currentLang.example ? `Use ${currentLang.name} script like: ${currentLang.example}` : ''}
      Keep Scientific Name in Latin only.

      Use this EXACT format:

      Description:
      (2-3 sentences about plant appearance)

      Plant Details:
      Common Name: (local name)
      Scientific Name: (Latin name)
      Care Instructions: (one paragraph)
      Ideal Conditions: (one paragraph)`;

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('No response from API');
      }

      const plantInfo = parseResponse(text);

      if (currentLang.script) {
        const isValidScript = (text: string) => currentLang.script?.test(text);

        if (!(
          isValidScript(plantInfo.description) &&
          isValidScript(plantInfo.commonName) &&
          isValidScript(plantInfo.careInstructions) &&
          isValidScript(plantInfo.idealConditions)
        )) {
          throw new Error(`Response not in correct ${currentLang.name} script. Retrying...`);
        }
      }

      setPlantData(plantInfo);

      if (plantInfo.commonName) {
        await fetchYouTubeVideo(plantInfo.commonName);
      }
    } catch (error) {
      console.error('Error identifying plant:', error);

      if (error instanceof Error && error.message.includes('script')) {
        try {
          await identifyPlant(imageBase64);
        } catch (retryError) {
          setError('Unable to get response in correct language. Please try again.');
        }
      } else {
        setError(error instanceof Error ? error.message : translations.errors?.unexpected || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#faf3e7]">
      <Navbar />
      <main className="flex-grow py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <h1 className="text-4xl font-bold text-center text-[#22c55e]">
              {translations.home?.title || 'Plant Identifier'}
            </h1>

            <p className="text-xl text-gray-700 text-center max-w-2xl mx-auto">
              {translations.home?.subtitle || 'Upload an image or take a photo of a plant to identify it and learn more about its characteristics.'}
            </p>

            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc] p-8">
              <ImageUpload onImageSelect={identifyPlant} />
            </div>

            <div className="mb-12">
              {loading && (
                <div className="text-center p-8 bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc]">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin-slow w-16 h-16 text-[#22c55e]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.12,22.75a2.57,2.57,0,0,1-1.67-.62c-1.52-1.31-2.89-2.53-4.12-3.65l-.24-.22c-1.66-1.5-3.23-2.92-4.68-4.41A8.34,8.34,0,0,1,4.08,9.54,7.06,7.06,0,0,1,4.26,5,6.73,6.73,0,0,1,8.61,1.42a6.63,6.63,0,0,1,6.89,1.57,6.63,6.63,0,0,1,6.89-1.57A6.73,6.73,0,0,1,26.74,5a7.06,7.06,0,0,1,.18,4.58,8.34,8.34,0,0,1-2.33,4.31c-1.45,1.49-3,2.91-4.68,4.41l-.24.22c-1.23,1.12-2.6,2.34-4.12,3.65A2.57,2.57,0,0,1,17.12,22.75Z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-1">
                    <p className="text-[#22c55e] font-medium text-lg">
                      {translations.loading?.identifying || 'Identifying your plant'}
                    </p>
                    <div className="flex space-x-1">
                      <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-bounce"></span>
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm mt-2">
                    {translations.loading?.analyzing || 'Our AI is analyzing your plant\'s characteristics'}
                  </p>
                </div>
              )}

              {plantData && <PlantInfo plantData={plantData} />}

              {videoLoading && (
                <div className="text-center p-4 bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc] mt-4">
                  <p className="text-[#22c55e]">
                    {translations.loading?.fetchingVideo || 'Fetching care guide video...'}
                  </p>
                </div>
              )}

              {videoData && (
                <div className="max-w-4xl mx-auto mt-8 bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc] p-6">
                  <h2 className="text-2xl font-bold text-center text-[#22c55e] mb-4">
                    {translations.video?.title?.replace('{plantName}', plantData?.commonName) ||
                      `Complete Care Guide for ${plantData?.commonName}`}
                  </h2>

                  {videoData.language !== locale && (
                    <div className="text-amber-600 text-sm text-center mb-4">
                      {translations.video?.languageFallback?.replace(
                        '{preferredLanguage}',
                        languageConfig[locale as keyof typeof languageConfig]?.name
                      ).replace(
                        '{availableLanguage}',
                        languageConfig[videoData.language as keyof typeof languageConfig]?.name
                      ) || 
                        `Video not available in ${languageConfig[locale as keyof typeof languageConfig]?.name}. 
                         Showing ${languageConfig[videoData.language as keyof typeof languageConfig]?.name} version.`}
                    </div>
                  )}

                  <div className="relative pt-[56.25%]">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoData.id}`}
                      title={videoData.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                    ></iframe>
                  </div>

                  <div className="mt-4 space-y-2">
                    <h3 className="font-medium text-gray-900">{videoData.title}</h3>
                    {videoData.channelTitle && (
                      <p className="text-sm text-gray-600">
                        {translations.video?.channel || 'Channel'}: {videoData.channelTitle}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm text-center">
                      {translations.video?.description?.replace('{plantName}', plantData?.commonName) ||
                        `Learn everything about growing and caring for your ${plantData?.commonName}`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* How It Works section */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-[#22c55e] text-center mb-8">
                {translations.howItWorks?.title || 'How It Works'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <button
                    onClick={handleUploadCardClick}
                    className="bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc] p-6 hover:shadow-xl transition-all duration-300 w-full text-left cursor-pointer hover:bg-[#fff5e0] focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-opacity-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-[#22c55e] p-3 rounded-full">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {translations.howItWorks?.upload?.title || 'Upload Plant Photo'}
                        </h3>
                        <p className="text-gray-700">
                          {translations.howItWorks?.upload?.description || 'Take a clear photo of any plant you want to identify'}
                        </p>
                      </div>
                    </div>
                  </button>
                  <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white text-sm px-2 py-1 rounded -top-8 left-1/2 transform -translate-x-1/2">
                    {translations.howItWorks?.upload?.tooltip || 'Click to upload'}
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64String = reader.result as string;
                        identifyPlant(base64String);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                <div className="bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc] p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="bg-[#22c55e] p-3 rounded-full">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {translations.howItWorks?.identify?.title || 'Instant Analysis'}
                      </h3>
                      <p className="text-gray-700">
                        {translations.howItWorks?.identify?.description || 'Our AI instantly identifies your plant species'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc] p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="bg-[#22c55e] p-3 rounded-full">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {translations.howItWorks?.details?.title || 'Get Information'}
                      </h3>
                      <p className="text-gray-700">
                        {translations.howItWorks?.details?.description || 'Receive detailed plant characteristics and description'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc] p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="bg-[#22c55e] p-3 rounded-full">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {translations.howItWorks?.care?.title || 'Care Guide'}
                      </h3>
                      <p className="text-gray-700">
                        {translations.howItWorks?.care?.description || 'Learn how to care for your plant with detailed instructions'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}