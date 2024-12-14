'use client'

import { useState, useRef } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import ImageUpload from './components/ImageUpload'
import PlantInfo from './components/PlantInfo'
import Footer from './components/Footer'

export default function Home() {
  const [plantData, setPlantData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadCardClick = () => {
    fileInputRef.current?.click();
  };

  const identifyPlant = async (imageBase64: string) => {
    setLoading(true)
    setError(null)
    try {
      if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
        throw new Error('Google API key is not configured')
      }

      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

      const base64Data = imageBase64.split(',')[1]
      if (!base64Data) {
        throw new Error('Invalid image format')
      }

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg'
        }
      }

      const prompt = `Analyze this plant image and provide detailed information in exactly this format:

      Description:
      Provide 2-3 sentences describing the plant's key features, appearance, and general characteristics.

      Plant Details:
      Common Name: Provide the most widely used common name
      Scientific Name: Provide the genus and species
      Care Instructions: Provide a single, clear paragraph covering planting, watering, fertilizing, and maintenance
      Ideal Conditions: Provide a single paragraph about light, soil, temperature, and environmental needs`

      const result = await model.generateContent([prompt, imagePart])
      const response = await result.response
      const text = response.text()

      if (!text) {
        throw new Error('No response from API')
      }

      const parseResponse = (text: string) => {
        const cleanText = (str: string) => {
          return str
            .replace(/^[-*•]/gm, '')
            .replace(/\s+/g, ' ')
            .replace(/^\s+|\s+$/g, '')
            .replace(/\n+/g, ' ')
            .trim()
        }

        const extractSection = (content: string, startMarker: string, endMarker: string) => {
          const startIndex = content.toLowerCase().indexOf(startMarker.toLowerCase())
          if (startIndex === -1) return ''
          
          const searchFrom = startIndex + startMarker.length
          const endIndex = endMarker 
            ? content.toLowerCase().indexOf(endMarker.toLowerCase(), searchFrom)
            : content.length
          
          const extracted = content.slice(searchFrom, endIndex === -1 ? undefined : endIndex)
          return cleanText(extracted)
        }

        const description = extractSection(text, 'Description:', 'Plant Details:')
        const detailsSection = text.slice(text.toLowerCase().indexOf('plant details:'))
        
        const commonName = extractSection(detailsSection, 'Common Name:', 'Scientific Name:')
        const scientificName = extractSection(detailsSection, 'Scientific Name:', 'Care Instructions:')
        const careInstructions = extractSection(detailsSection, 'Care Instructions:', 'Ideal Conditions:')
        const idealConditions = extractSection(detailsSection, 'Ideal Conditions:', '\n\n')

        return {
          description,
          commonName,
          scientificName,
          careInstructions,
          idealConditions
        }
      }

      const plantInfo = parseResponse(text)
      setPlantData(plantInfo)
    } catch (error) {
      console.error('Error identifying plant:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#faf3e7]">
      <nav className="bg-[#22c55e] p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-white text-2xl font-bold">Plant Identifier</div>
          <div className="flex space-x-6">
            <a href="#" className="text-white hover:text-green-100">Home</a>
            <a href="#" className="text-white hover:text-green-100">About</a>
            <a href="#" className="text-white hover:text-green-100">Contact</a>
            <a href="#" className="text-white hover:text-green-100">FAQ</a>
          </div>
        </div>
      </nav>
      
      <main className="flex-grow py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <h1 className="text-4xl font-bold text-center text-[#22c55e]">
              Plant Identifier
            </h1>

            <p className="text-xl text-gray-700 text-center max-w-2xl mx-auto">
              Upload an image or take a photo of a plant to identify it and learn more about its characteristics.
            </p>

            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc] p-8">
              <ImageUpload onImageSelect={identifyPlant} />
            </div>

            {/* Loading and Results Section */}
            <div className="mb-12">
              {loading && (
                <div className="text-center p-8 bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc]">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    {/* Leaf Loading Animation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg 
                        className="animate-spin-slow w-16 h-16 text-[#22c55e]" 
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.12,22.75a2.57,2.57,0,0,1-1.67-.62c-1.52-1.31-2.89-2.53-4.12-3.65l-.24-.22c-1.66-1.5-3.23-2.92-4.68-4.41A8.34,8.34,0,0,1,4.08,9.54,7.06,7.06,0,0,1,4.26,5,6.73,6.73,0,0,1,8.61,1.42a6.63,6.63,0,0,1,6.89,1.57,6.63,6.63,0,0,1,6.89-1.57A6.73,6.73,0,0,1,26.74,5a7.06,7.06,0,0,1,.18,4.58,8.34,8.34,0,0,1-2.33,4.31c-1.45,1.49-3,2.91-4.68,4.41l-.24.22c-1.23,1.12-2.6,2.34-4.12,3.65A2.57,2.57,0,0,1,17.12,22.75Z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Loading text with dots animation */}
                  <div className="flex items-center justify-center space-x-1">
                    <p className="text-[#22c55e] font-medium text-lg">Identifying your plant</p>
                    <div className="flex space-x-1">
                      <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-bounce"></span>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-sm mt-2">
                    Our AI is analyzing your plant's characteristics
                  </p>
                </div>
              )}

              {plantData && <PlantInfo plantData={plantData} />}
            </div>

            {/* How It Works Section */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-[#22c55e] text-center mb-8">
                How It Works
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Step 1: Upload - Now Clickable */}
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
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Upload Plant Photo</h3>
                        <p className="text-gray-700">Take a clear photo of any plant you want to identify</p>
                      </div>
                    </div>
                  </button>
                  <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white text-sm px-2 py-1 rounded -top-8 left-1/2 transform -translate-x-1/2">
                    Click to upload
                  </div>
                </div>

                {/* Hidden file input */}
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

                {/* Step 2: Identify */}
                <div className="bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc] p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="bg-[#22c55e] p-3 rounded-full">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">Instant Analysis</h3>
                      <p className="text-gray-700">Our AI instantly identifies your plant species</p>
                    </div>
                  </div>
                </div>

                {/* Step 3: Details */}
                <div className="bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc] p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="bg-[#22c55e] p-3 rounded-full">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">Get Information</h3>
                      <p className="text-gray-700">Receive detailed plant characteristics and description</p>
                    </div>
                  </div>
                </div>

                {/* Step 4: Care */}
                <div className="bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc] p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="bg-[#22c55e] p-3 rounded-full">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">Care Guide</h3>
                      <p className="text-gray-700">Learn how to care for your plant with detailed instructions</p>
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
  )
}