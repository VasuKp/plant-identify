'use client'

import { useState, useRef, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { useLanguage } from '../context/languagecontext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
    const router = useRouter();
    const [plantData, setPlantData] = useState<PlantInfo | null>(null);
    const [videoData, setVideoData] = useState<YouTubeVideo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [videoLoading, setVideoLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

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

    const getUserLocation = () => {
        setLocationLoading(true);
        setLocationError(null);
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userCoords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setUserLocation(userCoords);
                    setLocationLoading(false);
                    
                    // Navigate to nursery finder with plant info
                    if (plantData) {
                        // Ensure we convert numbers to strings for URL parameters
                        const lat = userCoords.lat.toString();
                        const lng = userCoords.lng.toString();
                        const queryParams = new URLSearchParams({
                            plant: plantData.commonName,
                            scientific: plantData.scientificName,
                            lat,
                            lng
                        }).toString();
                        
                        console.log(`Navigating to nursery finder with coordinates: ${lat},${lng}`);
                        router.push(`/shop/nursery-finder?${queryParams}`);
                    }
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setLocationError('Unable to access your location. Please enable location services and try again.');
                    setLocationLoading(false);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        } else {
            setLocationError('Geolocation is not supported by your browser');
            setLocationLoading(false);
        }
    };
    
    const handleShopClick = () => {
        setShowPurchaseModal(true);
    };
    
    const handleBuyThisPlant = () => {
        getUserLocation();
    };
    
    const handleGoToShop = () => {
        router.push('/shop');
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
                            <ImageUpload 
                                onImageSelect={(base64) => {
                                    identifyPlant(base64);
                                }} 
                            />
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="mt-8 text-center animate-pulse">
                                <svg className="w-16 h-16 mx-auto text-[#22c55e]" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="mt-4 text-xl font-medium text-[#22c55e]">
                                    {translations.loading?.identifying || 'Identifying your plant...'}
                                </p>
                                <p className="mt-2 text-gray-600">
                                    {translations.loading?.analyzing || 'Our AI is analyzing your plant\'s characteristics'}
                                </p>
                            </div>
                        )}

                        {/* Plant Information Display */}
                        {plantData && !loading && (
                            <>
                                <PlantInfo plantData={plantData} isLoading={loading} />
                                
                                {/* Add a "Buy This Plant" button */}
                                <div className="mt-8 text-center">
                                    <button
                                        onClick={handleShopClick}
                                        className="bg-[#22c55e] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#1ea550] transition-colors font-medium inline-flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        {translations.shop?.buyPlant || 'Buy This Plant'}
                                    </button>
                                </div>
                                
                                {/* YouTube Video Section */}
                                <div className="mt-12">
                                    <h2 className="text-2xl font-bold mb-6 text-[#22c55e]">
                                        {videoData 
                                            ? (translations.video?.title || 'Care Guide Video').replace('{plantName}', plantData.commonName)
                                            : (translations.video?.noVideo || 'No Care Guide Video Available')
                                        }
                                    </h2>
                                    
                                    {videoLoading && (
                                        <div className="text-center py-8">
                                            <div className="animate-pulse">
                                                <svg className="w-12 h-12 mx-auto text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="mt-4 text-gray-600">
                                                    {translations.loading?.videoLoading || 'Finding care guide videos...'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {videoData && !videoLoading && (
                                        <div className="bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc] overflow-hidden">
                                            <div className="aspect-w-16 aspect-h-9">
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${videoData.id}`}
                                                    title={videoData.title}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    className="w-full h-96"
                                                ></iframe>
                                            </div>
                                            <div className="p-6">
                                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                    {videoData.title}
                                                </h3>
                                                {videoData.language !== locale && (
                                                    <p className="text-yellow-600 text-sm mb-2">
                                                        {(translations.video?.languageFallback || 'Video not available in {preferredLanguage}. Showing {availableLanguage} version.')
                                                            .replace('{preferredLanguage}', languageConfig[locale as keyof typeof languageConfig]?.name || locale)
                                                            .replace('{availableLanguage}', languageConfig[videoData.language as keyof typeof languageConfig]?.name || videoData.language)}
                                                    </p>
                                                )}
                                                {videoData.channelTitle && (
                                                    <p className="text-gray-600 text-sm">
                                                        <span className="font-medium">{translations.video?.channel || 'Channel'}:</span> {videoData.channelTitle}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {!videoData && !videoLoading && plantData && (
                                        <div className="bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc] p-6 text-center">
                                            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                            <p className="text-gray-600">
                                                {translations.video?.noVideo || 'No care guide video available for this plant'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

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
            
            {/* Purchase Modal */}
            {showPurchaseModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">
                                {translations.shop?.findPlant || 'Find This Plant'}
                            </h3>
                            <p className="text-gray-600 mt-2">
                                {translations.shop?.findPlantDescription || `We'll find nearby nurseries that sell ${plantData?.commonName || 'this plant'}.`}
                            </p>
                        </div>
                        
                        {locationError && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
                                <p>{locationError}</p>
                            </div>
                        )}
                        
                        <div className="flex flex-col space-y-3">
                            <button 
                                onClick={handleBuyThisPlant}
                                disabled={locationLoading}
                                className="w-full py-3 bg-[#22c55e] text-white rounded-lg hover:bg-[#1ea550] transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {locationLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {translations.shop?.locating || 'Locating...'}
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {translations.shop?.findNearbyNurseries || 'Find Nearby Nurseries'}
                                    </>
                                )}
                            </button>
                            <button 
                                onClick={handleGoToShop}
                                className="w-full py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                            >
                                {translations.shop?.browseAllPlants || 'Browse All Plants'}
                            </button>
                            <button 
                                onClick={() => setShowPurchaseModal(false)}
                                className="w-full py-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                            >
                                {translations.common?.cancel || 'Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <Footer />
        </div>
    );
}