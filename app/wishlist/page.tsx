'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '../context/languagecontext'
import Navbar from '../components/Navigation'
import Footer from '../components/Footer'
import { FaHeart, FaShoppingCart, FaTrash } from 'react-icons/fa'
import { BiArrowBack } from 'react-icons/bi'

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

export default function Wishlist() {
    const { locale } = useLanguage()
    const [wishlistedPlants, setWishlistedPlants] = useState<Plant[]>([])
    const [loading, setLoading] = useState(true)
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
    
    // Update rupee conversion rate (1 USD = approximately 75 INR)
    const rupeeConversionRate = 75;

    // Translations
    const t = {
        en: {
            title: 'My Wishlist',
            emptyWishlist: 'Your wishlist is empty',
            continueShopping: 'Continue Shopping',
            addToCart: 'Add to Cart',
            remove: 'Remove',
            loading: 'Loading wishlist...'
        },
        hi: {
            title: 'मेरी इच्छा-सूची',
            emptyWishlist: 'आपकी इच्छा-सूची खाली है',
            continueShopping: 'खरीदारी जारी रखें',
            addToCart: 'कार्ट में जोड़ें',
            remove: 'हटाएं',
            loading: 'इच्छा-सूची लोड हो रही है...'
        },
        gu: {
            title: 'મારી ઇચ્છાસૂચિ',
            emptyWishlist: 'તમારી ઇચ્છાસૂચિ ખાલી છે',
            continueShopping: 'ખરીદી ચાલુ રાખો',
            addToCart: 'કાર્ટમાં ઉમેરો',
            remove: 'દૂર કરો',
            loading: 'ઇચ્છાસૂચિ લોડ થઈ રહી છે...'
        }
    }

    const translations = t[locale as keyof typeof t] || t.en;

    useEffect(() => {
        // In a real app, you would fetch the wishlist from API or localStorage
        // For demo, we'll use sample data
        setTimeout(() => {
            const sampleWishlist: Plant[] = [
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
                    id: '5',
                    name: {
                        en: 'Fiddle Leaf Fig',
                        hi: 'फिडल लीफ फिग',
                        gu: 'ફિડલ લીફ ફિગ'
                    },
                    scientificName: 'Ficus lyrata',
                    price: 49.99,
                    image: '/images/plants/fiddle-leaf-fig.jpg',
                    fallbackImage: '/images/plants-fallback/plant-fallback.jpg',
                    category: 'indoor',
                    difficulty: 'Hard',
                    light: 'Bright',
                    water: 'Weekly',
                    petFriendly: false
                }
            ];
            
            // Check if there's any wishlist data in localStorage
            const storedWishlist = localStorage.getItem('wishlist');
            if (storedWishlist) {
                try {
                    const parsedWishlist = JSON.parse(storedWishlist);
                    setWishlistedPlants(parsedWishlist);
                } catch (error) {
                    console.error('Error parsing wishlist data:', error);
                    setWishlistedPlants(sampleWishlist);
                }
            } else {
                setWishlistedPlants(sampleWishlist);
            }
            
            setLoading(false);
        }, 1000);
    }, []);

    const handleImageError = (id: string) => {
        setImageErrors(prev => ({...prev, [id]: true}));
    };

    const getPlantImage = (plant: Plant) => {
        if (imageErrors[plant.id]) {
            return plant.fallbackImage;
        }
        return plant.image;
    };

    const removeFromWishlist = (plantId: string) => {
        // Remove the plant from the wishlist
        const updatedWishlist = wishlistedPlants.filter(plant => plant.id !== plantId);
        setWishlistedPlants(updatedWishlist);
        
        // Update localStorage
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    };

    const addToCart = (plant: Plant) => {
        // In a real app, you would call an API to add to cart
        alert(`${plant.name[locale as keyof typeof plant.name]} added to cart!`);
        
        // Optionally remove from wishlist after adding to cart
        // removeFromWishlist(plant.id);
    };

    return (
        <div className="bg-[#f0faf0] min-h-screen">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#2e7d32]">{translations.title}</h1>
                    <Link href="/shop" className="flex items-center text-[#2e7d32] hover:text-[#22c55e]">
                        <BiArrowBack className="mr-2" />
                        <span>{translations.continueShopping}</span>
                    </Link>
                </div>
                
                {/* Wishlist Items */}
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                        <p className="text-gray-600">{translations.loading}</p>
                    </div>
                ) : wishlistedPlants.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="w-20 h-20 mx-auto mb-4">
                            <FaHeart className="w-full h-full text-gray-300" />
                        </div>
                        <p className="text-xl text-gray-600 mb-6">{translations.emptyWishlist}</p>
                        <Link 
                            href="/shop" 
                            className="inline-flex items-center bg-[#22c55e] text-white px-4 py-2 rounded-lg hover:bg-[#1ea550] transition-colors"
                        >
                            {translations.continueShopping}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {wishlistedPlants.map((plant) => (
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
                                    <button
                                        onClick={() => removeFromWishlist(plant.id)}
                                        className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors"
                                        aria-label="Remove from wishlist"
                                    >
                                        <FaTrash className="text-red-500 text-sm" />
                                    </button>
                                    {plant.petFriendly && (
                                        <div className="absolute top-3 left-3 bg-[#22c55e] text-white text-xs px-2 py-1 rounded-full">
                                            Pet Friendly
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-4">
                                    <Link href={`/shop/${plant.id}`}>
                                        <h3 className="font-semibold text-[#2e7d32] hover:underline">{plant.name[locale as keyof typeof plant.name]}</h3>
                                    </Link>
                                    <p className="text-sm text-gray-500 italic">{plant.scientificName}</p>
                                    <div className="mt-3 flex justify-between items-center">
                                        <span className="text-lg font-bold text-[#22c55e]">₹{(plant.price * rupeeConversionRate).toFixed(0)}</span>
                                        <button
                                            onClick={() => addToCart(plant)}
                                            className="flex items-center gap-1 bg-[#22c55e] text-white px-3 py-1 rounded hover:bg-[#1ea550] transition-colors text-sm"
                                        >
                                            <FaShoppingCart className="text-xs" />
                                            <span>{translations.addToCart}</span>
                                        </button>
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