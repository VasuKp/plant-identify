'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '../../components/Navigation'
import Footer from '../../components/Footer'
import { FaLeaf, FaThumbsUp, FaStore, FaMapMarkerAlt, FaShoppingCart } from 'react-icons/fa'

interface PlantResult {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  image: string;
  careInfo: {
    light: string;
    water: string;
    temperature: string;
    soil: string;
  };
  similarPlants?: string[];
}

export default function IdentificationResult() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [plant, setPlant] = useState<PlantResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showNurseryPrompt, setShowNurseryPrompt] = useState(false)
  
  // Extract the plant ID or image from search params
  const plantId = searchParams.get('id')
  const imageUrl = searchParams.get('image')

  useEffect(() => {
    const fetchPlantDetails = async () => {
      try {
        setLoading(true)
        
        // In a real app, you would fetch from your API
        // For now, we'll simulate a response with sample data
        setTimeout(() => {
          // Sample data
          const samplePlant: PlantResult = {
            id: plantId || 'plant123',
            name: 'Monstera Deliciosa',
            scientificName: 'Monstera deliciosa',
            description: 'The Monstera Deliciosa, or Swiss Cheese Plant, is famous for its quirky natural leaf holes. This popular houseplant is native to tropical forests of southern Mexico and is relatively easy to care for, making it perfect for beginner plant parents.',
            image: imageUrl || '/images/plants/monstera-deliciosa.jpg',
            careInfo: {
              light: 'Bright, indirect light. Avoid direct sunlight as it can scorch the leaves.',
              water: 'Water when the top 2-3 inches of soil are dry. Reduce watering in winter.',
              temperature: 'Prefers temperatures between 65-85°F (18-29°C). Keep away from cold drafts.',
              soil: 'Well-draining potting mix rich in organic matter.'
            },
            similarPlants: ['Philodendron', 'Pothos', 'Peace Lily']
          }
          
          setPlant(samplePlant)
          setLoading(false)
        }, 1500)
      } catch (error) {
        console.error('Error fetching plant details:', error)
        setError('Failed to load plant identification results. Please try again.')
        setLoading(false)
      }
    }
    
    fetchPlantDetails()
  }, [plantId, imageUrl])

  const handleFindNurseries = () => {
    router.push(`/shop/nursery-finder?plant=${encodeURIComponent(plant?.name || '')}`)
  }

  const handleBuyOnline = () => {
    // Search for this plant in the shop
    router.push(`/shop?search=${encodeURIComponent(plant?.name || '')}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0faf0] flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-[#e8f5e9] rounded-full flex items-center justify-center">
              <FaLeaf className="text-3xl text-[#22c55e] animate-pulse" />
            </div>
            <h2 className="text-2xl font-semibold text-[#2e7d32] mb-2">Analyzing Your Plant</h2>
            <p className="text-gray-600">Our system is identifying the plant from your image...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !plant) {
    return (
      <div className="min-h-screen bg-[#f0faf0] flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-red-600 mb-2">Identification Failed</h2>
            <p className="text-gray-600 mb-6">{error || 'Unable to identify the plant. Please try again with a clearer image.'}</p>
            <Link href="/identify" className="px-6 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#1ea550] transition-colors">
              Try Again
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0faf0] flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-5xl mx-auto">
          <div className="md:flex">
            <div className="md:w-1/2 relative h-64 md:h-auto">
              <Image 
                src={plant.image} 
                alt={plant.name} 
                fill 
                className="object-cover"
              />
              <div className="absolute top-4 left-4 bg-[#22c55e] text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <FaThumbsUp className="mr-1" /> Identified
              </div>
            </div>
            
            <div className="p-6 md:w-1/2">
              <div className="flex flex-col md:h-full justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-[#2e7d32] mb-1">{plant.name}</h1>
                  <p className="text-gray-600 italic mb-4">{plant.scientificName}</p>
                  
                  <p className="text-gray-700 mb-4">{plant.description}</p>
                  
                  <div className="mb-4">
                    <h2 className="font-semibold text-[#2e7d32] mb-2">Care Information:</h2>
                    <div className="space-y-2">
                      <div className="bg-[#f0faf0] p-3 rounded-lg">
                        <p className="text-sm"><span className="font-medium">Light:</span> {plant.careInfo.light}</p>
                      </div>
                      <div className="bg-[#f0faf0] p-3 rounded-lg">
                        <p className="text-sm"><span className="font-medium">Water:</span> {plant.careInfo.water}</p>
                      </div>
                      <div className="bg-[#f0faf0] p-3 rounded-lg">
                        <p className="text-sm"><span className="font-medium">Temperature:</span> {plant.careInfo.temperature}</p>
                      </div>
                      <div className="bg-[#f0faf0] p-3 rounded-lg">
                        <p className="text-sm"><span className="font-medium">Soil:</span> {plant.careInfo.soil}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h2 className="font-semibold text-gray-700 mb-3">Would you like to add this plant to your collection?</h2>
                  <div className="flex flex-col space-y-3">
                    <button 
                      onClick={handleBuyOnline}
                      className="w-full py-3 bg-[#22c55e] text-white rounded-lg hover:bg-[#1ea550] transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <FaShoppingCart />
                      Buy Online
                    </button>
                    <button 
                      onClick={handleFindNurseries}
                      className="w-full py-3 bg-[#e6f2fd] text-[#0057b7] rounded-lg hover:bg-[#d6e8f9] transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <FaMapMarkerAlt />
                      Find Nearby Nurseries
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {plant.similarPlants && plant.similarPlants.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-[#2e7d32] mb-4">Similar Plants You Might Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {plant.similarPlants.map((name, index) => (
                <Link href={`/shop?search=${encodeURIComponent(name)}`} key={index} className="bg-white rounded-lg p-4 border border-[#e0f0e0] hover:shadow-md transition-shadow flex items-center">
                  <div className="w-12 h-12 bg-[#f0faf0] rounded-full flex items-center justify-center mr-3">
                    <FaLeaf className="text-[#22c55e]" />
                  </div>
                  <span className="font-medium text-gray-700">{name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
} 