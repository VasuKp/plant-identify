'use client'

import { useState } from 'react'
import { useLanguage } from '../context/languagecontext'
import Navbar from '../components/Navigation'
import Image from 'next/image'

interface PlantGuide {
  id: number;
  name: string;
  scientificName: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  image: string;
  description: string;
  careInstructions: {
    water: string;
    light: string;
    temperature: string;
    soil: string;
  };
  commonProblems: string[];
}

export default function PlantGuide() {
  const { translations } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedPlant, setSelectedPlant] = useState<PlantGuide | null>(null);

  // Example plant guides data
  const plantGuides: PlantGuide[] = [
    {
      id: 1,
      name: "Monstera Deliciosa",
      scientificName: "Monstera deliciosa",
      category: "indoor",
      difficulty: "easy",
      image: "/images/plants/monstera-deliciosa.jpg",
      description: "The Monstera Deliciosa, or Swiss Cheese Plant, is famous for its quirky natural leaf holes. A vibrant tropical plant that is easy to care for and makes a statement in any room.",
      careInstructions: {
        water: "Water when top 2-3 inches of soil is dry, typically every 1-2 weeks",
        light: "Bright indirect light; avoid direct sunlight which can scorch leaves",
        temperature: "65-85°F (18-29°C); keep away from cold drafts",
        soil: "Well-draining, rich potting mix with peat moss and perlite"
      },
      commonProblems: [
        "Yellow leaves (often from overwatering)",
        "Brown leaf tips (low humidity or inconsistent watering)",
        "Leggy growth (insufficient light)",
        "Root rot (poor drainage or overwatering)",
        "Lack of fenestration/holes in young leaves (insufficient light or immature plant)"
      ]
    },
    {
      id: 2,
      name: "Peace Lily",
      scientificName: "Spathiphyllum wallisii",
      category: "indoor",
      difficulty: "medium",
      image: "/images/plants/Peace Lily.webp",
      description: "The Peace Lily is a popular indoor plant known for its elegant white flowers and air-purifying qualities. It thrives in low to medium light conditions.",
      careInstructions: {
        water: "Keep soil consistently moist but not soggy; drooping leaves indicate thirst",
        light: "Low to medium indirect light; can tolerate shade but flowers best with more light",
        temperature: "65-80°F (18-27°C); protect from cold drafts",
        soil: "Rich, loose potting mix with good drainage"
      },
      commonProblems: [
        "Brown leaf tips (low humidity or fluoride in water)",
        "Wilting (underwatering or root issues)",
        "Yellow leaves (overwatering)",
        "Lack of flowers (insufficient light)",
        "Leaf spot diseases (overwatering or poor air circulation)"
      ]
    },
    {
      id: 3,
      name: "Aloe Vera",
      scientificName: "Aloe barbadensis miller",
      category: "succulents",
      difficulty: "easy",
      image: "/images/plants/aloe-vera.webp",
      description: "Aloe Vera is a succulent plant species known for its medicinal properties and distinctive fleshy leaves. Easy to care for, it thrives in sunny spots and requires minimal watering.",
      careInstructions: {
        water: "Water deeply but infrequently, allowing soil to dry completely between waterings",
        light: "Bright, direct to indirect sunlight for at least 6 hours daily",
        temperature: "55-80°F (13-27°C); protect from frost",
        soil: "Cactus/succulent mix or well-draining sandy soil"
      },
      commonProblems: [
        "Soft, mushy leaves (overwatering)",
        "Brown, dry leaf tips (underwatering)",
        "Leggy, stretching growth (insufficient light)",
        "Root rot (poor drainage or overwatering)",
        "Pests like mealybugs and scale insects"
      ]
    },
    {
      id: 4,
      name: "Pilea Peperomioides",
      scientificName: "Pilea peperomioides",
      category: "indoor",
      difficulty: "medium",
      image: "/images/plants/Pilea Peperomioides.webp",
      description: "The Pilea Peperomioides, also known as the Chinese Money Plant, is beloved for its round, coin-shaped leaves. It is easy to propagate and makes an attractive addition to any indoor space.",
      careInstructions: {
        water: "Water when top inch of soil is dry; ensure good drainage to prevent root rot",
        light: "Bright indirect light; rotate regularly for even growth",
        temperature: "60-75°F (15-24°C); avoid cold drafts",
        soil: "Well-draining potting mix; add perlite for better drainage"
      },
      commonProblems: [
        "Curling leaves (too much direct sunlight)",
        "Pale, leggy growth (insufficient light)",
        "Yellow leaves (overwatering)",
        "Brown spots (sunburn)",
        "Drooping leaves (underwatering)"
      ]
    },
    {
      id: 5,
      name: "Snake Plant",
      scientificName: "Sansevieria trifasciata",
      category: "indoor",
      difficulty: "easy",
      image: "/images/plants/snake-plant.webp",
      description: "The Snake Plant is a hardy indoor plant that can survive in almost any condition. Its tall, architectural leaves add a modern touch to any space.",
      careInstructions: {
        water: "Water sparingly, allowing soil to dry completely between waterings",
        light: "Tolerates low light but grows best in indirect bright light",
        temperature: "70-90°F (21-32°C); can survive cooler temperatures",
        soil: "Well-draining potting mix; cactus mix works well"
      },
      commonProblems: [
        "Soft, mushy stems (overwatering)",
        "Brown, crispy leaf tips (underwatering or low humidity)",
        "Root rot (poor drainage or overwatering)",
        "Slow or no growth (insufficient light)",
        "Pests like spider mites and mealybugs"
      ]
    },
    {
      id: 6,
      name: "Fiddle Leaf Fig",
      scientificName: "Ficus lyrata",
      category: "indoor",
      difficulty: "hard",
      image: "/images/plants/Fiddle Leaf Fig.webp",
      description: "The Fiddle Leaf Fig is known for its large, violin-shaped leaves that create a dramatic silhouette. This popular houseplant requires consistent care but rewards with stunning vertical growth and statement presence.",
      careInstructions: {
        water: "Water when top inch of soil is dry; keep consistent watering schedule",
        light: "Bright indirect light; some direct morning sun is beneficial",
        temperature: "65-75°F (18-24°C); avoid drafts and sudden temperature changes",
        soil: "Well-draining, rich potting mix with good aeration"
      },
      commonProblems: [
        "Brown spots (overwatering or bacterial infection)",
        "Dropping leaves (stress from changes in environment)",
        "Yellow leaves (overwatering)",
        "Leaf edges turning brown (low humidity)",
        "Pest infestations like spider mites"
      ]
    },
    {
      id: 7,
      name: "ZZ Plant",
      scientificName: "Zamioculcas zamiifolia",
      category: "indoor",
      difficulty: "easy",
      image: "/images/plants/zz plant.webp",
      description: "The ZZ Plant is exceptionally hardy with shiny, dark green leaves that grow from thick stems. It can tolerate neglect, low light, and infrequent watering, making it perfect for busy people or office environments.",
      careInstructions: {
        water: "Water sparingly, allowing soil to dry completely between waterings",
        light: "Tolerates low light conditions; avoid direct sunlight",
        temperature: "65-75°F (18-24°C); tolerates a wide range",
        soil: "Well-draining potting mix; cactus mix works well"
      },
      commonProblems: [
        "Yellow leaves (overwatering)",
        "Leaf drop (overwatering or extreme temperatures)",
        "Brown leaf tips (tap water with high fluoride)",
        "Stunted growth (nutrient deficiency)",
        "Root rot (poor drainage or overwatering)"
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'All Plants' },
    { id: 'indoor', label: 'Indoor Plants' },
    { id: 'outdoor', label: 'Outdoor Plants' },
    { id: 'succulents', label: 'Succulents' },
    { id: 'herbs', label: 'Herbs' },
  ];

  const difficulties = [
    { id: 'all', label: 'All Difficulties' },
    { id: 'easy', label: 'Easy' },
    { id: 'medium', label: 'Medium' },
    { id: 'hard', label: 'Hard' },
  ];

  const filteredGuides = plantGuides.filter(guide => {
    const matchesSearch = guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || guide.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#faf3e7]">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#22c55e] mb-8 text-center">
            Plant Care Guides
          </h1>

          {/* Search and Filters */}
          <div className="bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc] p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search plants..."
                className="w-full px-4 py-2 border border-[#e6d5bc] rounded-lg focus:ring-[#22c55e] focus:border-[#22c55e] bg-white text-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <select
                className="w-full px-4 py-2 border border-[#e6d5bc] rounded-lg focus:ring-[#22c55e] focus:border-[#22c55e] bg-white text-gray-800"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>

              <select
                className="w-full px-4 py-2 border border-[#e6d5bc] rounded-lg focus:ring-[#22c55e] focus:border-[#22c55e] bg-white text-gray-800"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty.id} value={difficulty.id}>
                    {difficulty.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Plant Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.length > 0 ? (
              filteredGuides.map(guide => (
                <div
                  key={guide.id}
                  className="bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc] overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedPlant(guide)}
                >
                  <div className="relative h-48">
                    <Image
                      src={guide.image}
                      alt={guide.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-[#22c55e] mb-1">
                      {guide.name}
                    </h3>
                    <p className="text-gray-600 italic text-sm mb-3">
                      {guide.scientificName}
                    </p>
                    <p className="text-gray-700 mb-4">
                      {guide.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        guide.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        guide.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {guide.difficulty}
                      </span>
                      <button className="text-[#22c55e] font-semibold hover:text-[#16a34a]">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-12 text-center">
                <div className="bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc] p-8 max-w-lg mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-amber-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No plants found</h3>
                  <p className="text-gray-600 mb-4">We couldn't find any plants matching your search or filter criteria.</p>
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedDifficulty('all');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#22c55e] hover:bg-[#16a34a]"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Plant Detail Modal */}
          {selectedPlant && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-[#fff9ed] rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-[#22c55e]">
                        {selectedPlant.name}
                      </h2>
                      <p className="text-gray-600 italic">
                        {selectedPlant.scientificName}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedPlant(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="relative h-64 rounded-lg overflow-hidden mb-6">
                    <Image
                      src={selectedPlant.image}
                      alt={selectedPlant.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-[#22c55e] mb-2">
                        Care Instructions
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                          <p className="font-medium text-gray-700">Water</p>
                          <p className="text-gray-600">{selectedPlant.careInstructions.water}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="font-medium text-gray-700">Light</p>
                          <p className="text-gray-600">{selectedPlant.careInstructions.light}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="font-medium text-gray-700">Temperature</p>
                          <p className="text-gray-600">{selectedPlant.careInstructions.temperature}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="font-medium text-gray-700">Soil</p>
                          <p className="text-gray-600">{selectedPlant.careInstructions.soil}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[#22c55e] mb-2">
                        Common Problems
                      </h3>
                      <ul className="list-disc list-inside text-gray-700">
                        {selectedPlant.commonProblems.map((problem, index) => (
                          <li key={index}>{problem}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}