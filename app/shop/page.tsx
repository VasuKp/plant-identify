'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '../context/languagecontext'
import Navbar from '../components/Navigation'
import Footer from '../components/Footer'
import LanguageSwitcher from '../components/languageswitcher'
import { useRouter } from 'next/navigation'

// Plant type definition
interface Plant {
    id: string;
    name: {
        en: string;
        hi: string;
        gu: string;
    };
    scientificName: string;
    price: number;
    image: string;
    fallbackImage: string;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    light: 'Low' | 'Indirect' | 'Bright';
    water: 'Weekly' | 'Bi-weekly' | 'Monthly';
    petFriendly: boolean;
}

export default function ShopPlants() {
    const { translations, locale } = useLanguage()
    const [plants, setPlants] = useState<Plant[]>([])
    const [filteredPlants, setFilteredPlants] = useState<Plant[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeCategory, setActiveCategory] = useState('all')
    const [sortOption, setSortOption] = useState('popular')
    const [imageError, setImageError] = useState<Record<string, boolean>>({})
    const router = useRouter()

    // Update rupee conversion rate (1 USD = approximately 75 INR)
    const rupeeConversionRate = 75;

    // Shop translations
    const shopText = {
        en: {
            title: 'Shop Plants',
            subtitle: 'Find the perfect addition to your plant collection',
            search: 'Search plants...',
            categories: {
                all: 'All Plants',
                indoor: 'Indoor Plants',
                outdoor: 'Outdoor Plants',
                succulents: 'Succulents',
                herbs: 'Herbs',
                flowering: 'Flowering Plants',
                rare: 'Rare Plants'
            },
            sort: {
                label: 'Sort by:',
                popular: 'Most Popular',
                priceLow: 'Price: Low to High',
                priceHigh: 'Price: High to Low',
                newest: 'Newest Arrivals'
            },
            filters: 'Filters',
            difficulty: 'Difficulty',
            light: 'Light Requirements',
            water: 'Watering',
            petFriendly: 'Pet Friendly',
            price: 'Price Range',
            apply: 'Apply Filters',
            reset: 'Reset',
            addToCart: 'Add to Cart',
            viewDetails: 'View Details',
            noResults: 'No plants found matching your criteria',
            loading: 'Loading plants...'
        },
        hi: {
            title: 'पौधे खरीदें',
            subtitle: 'अपने पौधों के संग्रह में एक बेहतरीन जोड़ खोजें',
            search: 'पौधे खोजें...',
            categories: {
                all: 'सभी पौधे',
                indoor: 'इनडोर पौधे',
                outdoor: 'आउटडोर पौधे',
                succulents: 'सक्युलेंट्स',
                herbs: 'जड़ी-बूटियाँ',
                flowering: 'फूल वाले पौधे',
                rare: 'दुर्लभ पौधे'
            },
            sort: {
                label: 'क्रमबद्ध करें:',
                popular: 'सबसे लोकप्रिय',
                priceLow: 'मूल्य: कम से अधिक',
                priceHigh: 'मूल्य: अधिक से कम',
                newest: 'नए आगमन'
            },
            filters: 'फिल्टर',
            difficulty: 'कठिनाई',
            light: 'प्रकाश आवश्यकताएँ',
            water: 'पानी देना',
            petFriendly: 'पालतू जानवरों के अनुकूल',
            price: 'मूल्य सीमा',
            apply: 'फिल्टर लागू करें',
            reset: 'रीसेट करें',
            addToCart: 'कार्ट में जोड़ें',
            viewDetails: 'विवरण देखें',
            noResults: 'आपके मानदंडों से मेल खाते कोई पौधे नहीं मिले',
            loading: 'पौधे लोड हो रहे हैं...'
        },
        gu: {
            title: 'છોડ ખરીદો',
            subtitle: 'તમારા છોડ સંગ્રહમાં શ્રેષ્ઠ ઉમેરો શોધો',
            search: 'છોડ શોધો...',
            categories: {
                all: 'બધા છોડ',
                indoor: 'ઇનડોર છોડ',
                outdoor: 'આઉટડોર છોડ',
                succulents: 'સક્યુલેન્ટ્સ',
                herbs: 'જડીબુટ્ટીઓ',
                flowering: 'ફૂલ વાળા છોડ',
                rare: 'દુર્લભ છોડ'
            },
            sort: {
                label: 'ક્રમમાં ગોઠવો:',
                popular: 'સૌથી લોકપ્રિય',
                priceLow: 'કિંમત: ઓછીથી વધુ',
                priceHigh: 'કિંમત: વધુથી ઓછી',
                newest: 'નવા આગમન'
            },
            filters: 'ફિલ્ટર્સ',
            difficulty: 'મુશ્કેલી',
            light: 'પ્રકાશ જરૂરિયાતો',
            water: 'પાણી આપવું',
            petFriendly: 'પાલતુ પ્રાણી માટે અનુકૂળ',
            price: 'કિંમત શ્રેણી',
            apply: 'ફિલ્ટર્સ લાગુ કરો',
            reset: 'રીસેટ કરો',
            addToCart: 'કાર્ટમાં ઉમેરો',
            viewDetails: 'વિગતો જુઓ',
            noResults: 'તમારા માપદંડોને અનુરૂપ કોઈ છોડ મળ્યા નથી',
            loading: 'છોડ લોડ થઈ રહ્યા છે...'
        }
    }

    const t = shopText[locale as keyof typeof shopText] || shopText.en

    // Sample plant data
    useEffect(() => {
        // Simulate API call to fetch plants
        setTimeout(() => {
            const samplePlants: Plant[] = [
                {
                    id: '1',
                    name: {
                        en: 'Monstera Deliciosa',
                        hi: 'मॉन्स्टेरा डेलिसिओसा',
                        gu: 'મોન્સ્ટેરા ડેલિસિઓસા'
                    },
                    scientificName: 'Monstera deliciosa',
                    price: 29.99,
                    image: '/images/plants/monstera-deliciosa.jpg',
                    fallbackImage: '/images/plants-fallback/plant-fallback.jpg',
                    category: 'indoor',
                    difficulty: 'Easy',
                    light: 'Indirect',
                    water: 'Weekly',
                    petFriendly: false
                },
                {
                    id: '2',
                    name: {
                        en: 'Snake Plant',
                        hi: 'स्नेक प्लांट',
                        gu: 'સ્નેક પ્લાન્ટ'
                    },
                    scientificName: 'Sansevieria trifasciata',
                    price: 19.99,
                    image: '/images/plants/snake-plant.webp',
                    fallbackImage: '/images/plants-fallback/plant-fallback.jpg',
                    category: 'indoor',
                    difficulty: 'Easy',
                    light: 'Low',
                    water: 'Bi-weekly',
                    petFriendly: false
                },
                {
                    id: '3',
                    name: {
                        en: 'Peace Lily',
                        hi: 'पीस लिली',
                        gu: 'પીસ લિલી'
                    },
                    scientificName: 'Spathiphyllum wallisii',
                    price: 24.99,
                    image: '/images/plants/Peace Lily.webp',
                    fallbackImage: '/images/plants-fallback/plant-fallback.jpg',
                    category: 'indoor',
                    difficulty: 'Medium',
                    light: 'Indirect',
                    water: 'Weekly',
                    petFriendly: false
                },
                {
                    id: '4',
                    name: {
                        en: 'Aloe Vera',
                        hi: 'एलोवेरा',
                        gu: 'એલોવેરા'
                    },
                    scientificName: 'Aloe barbadensis miller',
                    price: 14.99,
                    image: '/images/plants/aloe-vera.webp',
                    fallbackImage: '/images/plants-fallback/plant-fallback.jpg',
                    category: 'succulents',
                    difficulty: 'Easy',
                    light: 'Bright',
                    water: 'Bi-weekly',
                    petFriendly: true
                },
                {
                    id: '5',
                    name: {
                        en: 'Fiddle Leaf Fig',
                        hi: 'फिडल लीफ फिग',
                        gu: 'ફિડલ લીફ ફિગ'
                    },
                    scientificName: 'Ficus lyrata',
                    price: 49.99,
                    image: '/images/plants/Fiddle Leaf Fig.webp',
                    fallbackImage: '/images/plants-fallback/plant-fallback.jpg',
                    category: 'indoor',
                    difficulty: 'Hard',
                    light: 'Bright',
                    water: 'Weekly',
                    petFriendly: false
                },
                {
                    id: '6',
                    name: {
                        en: 'Basil',
                        hi: 'तुलसी',
                        gu: 'તુલસી'
                    },
                    scientificName: 'Ocimum basilicum',
                    price: 9.99,
                    image: '/images/plants/basil.webp',
                    fallbackImage: '/images/plants-fallback/plant-fallback.jpg',
                    category: 'herbs',
                    difficulty: 'Easy',
                    light: 'Bright',
                    water: 'Weekly',
                    petFriendly: true
                },
                {
                    id: '7',
                    name: {
                        en: 'Lavender',
                        hi: 'लैवेंडर',
                        gu: 'લેવેન્ડર'
                    },
                    scientificName: 'Lavandula',
                    price: 12.99,
                    image: '/images/plants/Lavender.jpg',
                    fallbackImage: '/images/plants-fallback/plant-fallback.jpg',
                    category: 'herbs',
                    difficulty: 'Medium',
                    light: 'Bright',
                    water: 'Bi-weekly',
                    petFriendly: true
                },
                {
                    id: '8',
                    name: {
                        en: 'Pothos',
                        hi: 'पोथोस',
                        gu: 'પોથોસ'
                    },
                    scientificName: 'Epipremnum aureum',
                    price: 15.99,
                    image: '/images/plants/pothos.webp',
                    fallbackImage: '/images/plants-fallback/plant-fallback.jpg',
                    category: 'indoor',
                    difficulty: 'Easy',
                    light: 'Low',
                    water: 'Bi-weekly',
                    petFriendly: false
                },
                {
                    id: '9',
                    name: {
                        en: 'Rubber Plant',
                        hi: 'रबर प्लांट',
                        gu: 'રબર પ્લાન્ટ'
                    },
                    scientificName: 'Ficus elastica',
                    price: 34.99,
                    image: '/images/plants/Rubber plant.jpg',
                    fallbackImage: '/images/plants-fallback/plant-fallback.jpg',
                    category: 'indoor',
                    difficulty: 'Medium',
                    light: 'Indirect',
                    water: 'Weekly',
                    petFriendly: false
                },
                {
                    id: '10',
                    name: {
                        en: 'ZZ Plant',
                        hi: 'ज़ेड़ेड प्लांट',
                        gu: 'ઝેડઝેડ પ્લાન્ટ'
                    },
                    scientificName: 'Zamioculcas zamiifolia',
                    price: 27.99,
                    image: '/images/plants/zz plant.webp',
                    fallbackImage: '/images/plants-fallback/plant-fallback.jpg',
                    category: 'indoor',
                    difficulty: 'Easy',
                    light: 'Low',
                    water: 'Monthly',
                    petFriendly: false
                },
                {
                    id: '11',
                    name: {
                        en: 'Calathea Orbifolia',
                        hi: 'कैलाथिया ऑर्बिफोलिया',
                        gu: 'કેલેથિયા ઓર્બિફોલિયા'
                    },
                    scientificName: 'Calathea orbifolia',
                    price: 39.99,
                    image: '/images/plants/Calathea Orbifolia.jpeg',
                    fallbackImage: '/images/plants-fallback/plant-fallback.jpg',
                    category: 'indoor',
                    difficulty: 'Hard',
                    light: 'Indirect',
                    water: 'Weekly',
                    petFriendly: true
                },
                {
                    id: '12',
                    name: {
                        en: 'Pilea Peperomioides',
                        hi: 'पिलिया पेपेरोमिऑइड्स',
                        gu: 'પિલિયા પેપેરોમિઓઇડ્સ'
                    },
                    scientificName: 'Pilea peperomioides',
                    price: 18.99,
                    image: '/images/plants/Pilea Peperomioides.webp',
                    fallbackImage: '/images/plants-fallback/plant-fallback.jpg',
                    category: 'indoor',
                    difficulty: 'Medium',
                    light: 'Indirect',
                    water: 'Weekly',
                    petFriendly: true
                }
            ];
            
            setPlants(samplePlants);
            setFilteredPlants(samplePlants);
            setLoading(false);
        }, 1000);
    }, []);

    useEffect(() => {
        filterPlants();
    }, [activeCategory, searchTerm, sortOption, plants]);

    const filterPlants = () => {
        let filtered = [...plants];
        
        // Filter by category
        if (activeCategory !== 'all') {
            filtered = filtered.filter(plant => plant.category === activeCategory);
        }
        
        // Filter by search term
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(plant => 
                plant.name[locale as keyof typeof plant.name].toLowerCase().includes(lowerSearchTerm) ||
                plant.scientificName.toLowerCase().includes(lowerSearchTerm)
            );
        }
        
        // Sort plants
        switch(sortOption) {
            case 'priceLow':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'priceHigh':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                // In a real app, you would sort by date added
                filtered = filtered.reverse();
                break;
            default:
                // Sort by "popular" - in a real app, this would be based on sales or ratings
                break;
        }
        
        setFilteredPlants(filtered);
    };

    const handleImageError = (id: string) => {
        setImageError(prev => ({...prev, [id]: true}));
    };

    const getPlantImage = (plant: Plant) => {
        if (imageError[plant.id]) {
            return plant.fallbackImage;
        }
        return plant.image;
    };

    return (
        <div className="bg-[#f0faf0] min-h-screen">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-[#2e7d32]">{t.title}</h1>
                        <p className="mt-2 text-gray-600">{t.subtitle}</p>
                    </div>
                    <div className="hidden md:block">
                        <LanguageSwitcher />
                    </div>
                </div>
                
                {/* Search and Filters */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-8 border border-[#e0f0e0]">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <span className="absolute inset-y-0 left-3 flex items-center">
                                <svg className="w-5 h-5 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent text-black"
                                placeholder={t.search}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">{t.sort.label}</span>
                            <select
                                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent text-black"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                            >
                                <option value="popular" className="text-black">{t.sort.popular}</option>
                                <option value="priceLow" className="text-black">{t.sort.priceLow}</option>
                                <option value="priceHigh" className="text-black">{t.sort.priceHigh}</option>
                                <option value="newest" className="text-black">{t.sort.newest}</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {Object.entries(t.categories).map(([key, value]) => (
                        <button
                            key={key}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                activeCategory === key 
                                    ? 'bg-[#22c55e] text-white' 
                                    : 'bg-white text-[#2e7d32] hover:bg-[#e8f5e9] border border-[#c8e6c9]'
                            }`}
                            onClick={() => setActiveCategory(key)}
                        >
                            {value}
                        </button>
                    ))}
                </div>
                
                {/* Plant Grid */}
                {loading ? (
                    <div className="py-20 text-center">
                        <svg className="w-16 h-16 mx-auto text-[#22c55e] animate-pulse" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M17.1,7.8C15.6,6.3,13.5,5.5,11.4,5.5c-0.5,0-1,0-1.5,0.1C4.7,6.4,1.6,11.4,2.5,16.6c0.2,1.2,0.6,2.3,1.2,3.4 c0.1,0.2,0.3,0.3,0.5,0.3c0.1,0,0.2,0,0.3-0.1c0.3-0.2,0.4-0.5,0.2-0.8c-0.5-0.9-0.9-1.9-1.1-3c-0.7-4.3,2-8.5,6.3-9.4 C13.5,6.1,17,8.1,18,11.5c0.1,0.3,0.4,0.6,0.7,0.6c0.1,0,0.1,0,0.2,0c0.4-0.1,0.7-0.5,0.6-0.9C19.2,9.7,18.3,8.6,17.1,7.8z M7.4,18.5c-0.2,0-0.3,0-0.5-0.1c-0.7-0.4-0.9-1.4-0.5-2.1c0.6-1,1.5-1.9,2.5-2.6c0.9-0.6,1.9-1,3-1.3c0.3-0.1,0.5-0.1,0.8-0.2 c0.2,0,0.5-0.1,0.7-0.1c0.4-0.1,0.9,0.2,1,0.6c0.1,0.4-0.2,0.9-0.6,1c-0.2,0-0.4,0.1-0.5,0.1c-0.2,0-0.4,0.1-0.6,0.1 c-0.9,0.2-1.7,0.6-2.4,1.1c-0.7,0.5-1.4,1.1-1.9,1.9c-0.2,0.4-0.6,0.6-1,0.6C7.4,18.5,7.4,18.5,7.4,18.5z"/>
                        </svg>
                        <p className="text-gray-600">{t.loading}</p>
                    </div>
                ) : filteredPlants.length === 0 ? (
                    <div className="py-20 text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="mt-4 text-xl font-medium text-gray-600">{t.noResults}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredPlants.map((plant) => (
                            <div key={plant.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-[#e0f0e0]">
                                <div className="relative h-48 overflow-hidden">
                                    <Image
                                        src={getPlantImage(plant)}
                                        alt={plant.name[locale as keyof typeof plant.name]}
                                        width={300}
                                        height={300}
                                        className="w-full h-full object-cover"
                                        onError={() => handleImageError(plant.id)}
                                    />
                                    <div className="absolute top-3 right-3">
                                        {plant.petFriendly && (
                                            <div className="bg-[#22c55e] text-white text-xs px-2 py-1 rounded-full">
                                                Pet Friendly
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="p-4">
                                    <h3 className="font-semibold text-[#2e7d32]">{plant.name[locale as keyof typeof plant.name]}</h3>
                                    <p className="text-sm text-gray-500 italic">{plant.scientificName}</p>
                                    <div className="mt-3 flex justify-between items-center">
                                        <span className="text-lg font-bold text-[#22c55e]">₹{(plant.price * rupeeConversionRate).toFixed(0)}</span>
                                        <Link href={`/shop/${plant.id}`} className="bg-[#22c55e] text-white px-3 py-1 rounded hover:bg-[#1ea550] transition-colors text-sm">
                                            {t.viewDetails}
                                        </Link>
                                    </div>
                                    
                                    {/* Add to Cart button */}
                                    <button 
                                        onClick={() => router.push(`/shop/${plant.id}?action=add-to-cart`)}
                                        className="mt-2 w-full bg-[#2e7d32] text-white py-2 rounded hover:bg-[#246328] transition-colors text-sm flex items-center justify-center gap-1"
                                        aria-label={`View details and add ${plant.name[locale as keyof typeof plant.name]} to cart`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        {t.addToCart}
                                    </button>
                                    
                                    <div className="mt-3 grid grid-cols-3 gap-1 text-xs">
                                        <div className="bg-[#f0faf0] p-1 rounded text-center border border-[#e0f0e0]">
                                            <span className="block text-gray-500">Care</span>
                                            <span className="font-medium text-gray-700">{plant.difficulty}</span>
                                        </div>
                                        <div className="bg-[#f0faf0] p-1 rounded text-center border border-[#e0f0e0]">
                                            <span className="block text-gray-500">Light</span>
                                            <span className="font-medium text-gray-700">{plant.light}</span>
                                        </div>
                                        <div className="bg-[#f0faf0] p-1 rounded text-center border border-[#e0f0e0]">
                                            <span className="block text-gray-500">Water</span>
                                            <span className="font-medium text-gray-700">{plant.water}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            
            <Footer />
        </div>
    );
}