'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '../../context/languagecontext'
import Navbar from '../../components/Navigation'
import Footer from '../../components/Footer'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { FaStar, FaStarHalfAlt, FaRegStar, FaHeart, FaRegHeart, FaShare, FaTruck, FaCalendarCheck, FaMapMarkerAlt, FaStore } from 'react-icons/fa'
import { BiArrowBack } from 'react-icons/bi'

// Add CSS for price flash animation
const priceChangeAnimation = `
@keyframes priceFlash {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); color: #16a34a; }
    100% { transform: scale(1); }
}

.price-flash {
    animation: priceFlash 0.5s ease;
}
`;

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
    description?: {
        en: string;
        hi: string;
        gu: string;
    };
}

// Review type
interface Review {
    id: string;
    username: string;
    rating: number;
    comment: string;
    date: string;
}

// Cart item interface 
interface CartItem {
    id: string;
    name: {
        en: string;
        hi: string;
        gu: string;
    };
    scientificName: string;
    price: number;
    image: string;
    size: string;
    quantity: number;
    giftWrapping: boolean;
}

export default function PlantDetail() {
    const { translations, locale } = useLanguage()
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [plant, setPlant] = useState<Plant | null>(null)
    const [imageError, setImageError] = useState(false)
    const [quantity, setQuantity] = useState(1)
    const [activeTab, setActiveTab] = useState('description')
    const [reviews, setReviews] = useState<Review[]>([])
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [showShareOptions, setShowShareOptions] = useState(false)
    const [isGiftWrapping, setIsGiftWrapping] = useState(false)
    const [relatedPlants, setRelatedPlants] = useState<Plant[]>([])
    const [selectedSize, setSelectedSize] = useState('medium')
    const [showNurseryFinder, setShowNurseryFinder] = useState(false)
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
    const [nearbyNurseries, setNearbyNurseries] = useState<any[]>([])
    const [isLoadingNurseries, setIsLoadingNurseries] = useState(false)
    const [locationError, setLocationError] = useState('')
    const addToCartRef = useRef<HTMLButtonElement>(null)
    const [showReviewStep, setShowReviewStep] = useState(false)
    
    // Update rupee conversion rate (1 USD = approximately 75 INR)
    const rupeeConversionRate = 75;

    // Size price multipliers
    const sizePriceMultipliers = {
        small: 0.8,   // 80% of base price
        medium: 1,    // 100% of base price (unchanged)
        large: 1.25   // 125% of base price
    };

    // Calculate current price based on selected size
    const getCurrentPrice = () => {
        if (!plant) return 0;
        const basePrice = plant.price;
        const multiplier = sizePriceMultipliers[selectedSize as keyof typeof sizePriceMultipliers];
        return basePrice * multiplier;
    };

    useEffect(() => {
        // In a real app, you would fetch the plant data and reviews from an API
        // For now, we'll use sample data
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
                petFriendly: false,
                description: {
                    en: 'The Monstera Deliciosa, or Swiss Cheese Plant, is famous for its quirky natural leaf holes. A vibrant tropical plant that is easy to care for and makes a statement in any room.',
                    hi: 'मोंस्टेरा डेलिसिओसा, या स्विस चीज़ प्लांट, अपने विचित्र प्राकृतिक पत्ती छेदों के लिए प्रसिद्ध है। एक जीवंत उष्णकटिबंधीय पौधा जिसकी देखभाल करना आसान है और किसी भी कमरे में एक बयान देता है।',
                    gu: 'મોન્સ્ટેરા ડેલિસીઓસા, અથવા સ્વિસ ચીઝ પ્લાન્ટ, તેના વિચિત્ર કુદરતી પાંદડાના કાણા માટે જાણીતું છે. એક જીવંત ઉષ્ણકટિબંધીય છોડ જેની સંભાળ રાખવી સરળ છે અને કોઈપણ રૂમમાં નિવેદન આપે છે.'
                }
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
                petFriendly: false,
                description: {
                    en: 'The Snake Plant is a hardy indoor plant that can survive in almost any condition. Its tall, architectural leaves add a modern touch to any space.',
                    hi: 'स्नेक प्लांट एक मजबूत इनडोर प्लांट है जो लगभग किसी भी स्थिति में जीवित रह सकता है। इसके लंबे, वास्तुशिल्प पत्ते किसी भी स्थान पर एक आधुनिक स्पर्श जोड़ते हैं।',
                    gu: 'સ્નેક પ્લાન્ટ એક મજબૂત ઇનડોર પ્લાન્ટ છે જે લગભગ કોઈપણ પરિસ્થિતિમાં જીવી શકે છે. તેના ઊંચા, આર્કિટેક્ચરલ પાંદડા કોઈપણ જગ્યામાં આધુનિક સ્પર્શ ઉમેરે છે.'
                }
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
                petFriendly: false,
                description: {
                    en: 'The Peace Lily is a popular indoor plant known for its elegant white flowers and air-purifying qualities. It thrives in low to medium light conditions.',
                    hi: 'पीस लिली एक लोकप्रिय इनडोर प्लांट है जो अपने सुंदर सफेद फूलों और हवा को शुद्ध करने के गुणों के लिए जाना जाता है। यह कम से मध्यम प्रकाश वाली स्थितियों में पनपता है।',
                    gu: 'પીસ લિલી એક લોકપ્રિય ઇનડોર પ્લાન્ટ છે જે તેના સુંદર સફેદ ફૂલો અને હવા શુદ્ધિકરણ ગુણવત્તા માટે જાણીતું છે. તે ઓછી થી મધ્યમ પ્રકાશની સ્થિતિમાં ફૂલે-ફાલે છે.'
                }
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
                petFriendly: true,
                description: {
                    en: 'Aloe Vera is a succulent plant species known for its medicinal properties and distinctive fleshy leaves. Easy to care for, it thrives in sunny spots and requires minimal watering.',
                    hi: 'एलोवेरा एक रसीला पौधा है जो अपने औषधीय गुणों और विशिष्ट मांसल पत्तियों के लिए जाना जाता है। देखभाल करना आसान है, यह धूप वाले स्थानों पर पनपता है और न्यूनतम पानी की आवश्यकता होती है।',
                    gu: 'એલોવેરા એક રસદાર છોડની પ્રજાતિ છે જે તેના ઔષધીય ગુણોના કારણે અને તેના અનોખા મુલાયમ પાંદડાઓ માટે જાણીતી છે. સંભાળવામાં સરળ, તે તડકામાં ફૂલે-ફાલે છે અને ઓછા પાણીની જરૂર પડે છે.'
                }
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
                petFriendly: true,
                description: {
                    en: 'The Pilea Peperomioides, also known as the Chinese Money Plant, is beloved for its round, coin-shaped leaves. It is easy to propagate and makes an attractive addition to any indoor space.',
                    hi: 'पिलिया पेपेरोमिऑइड्स, जिसे चाइनीज मनी प्लांट के नाम से भी जाना जाता है, अपने गोल, सिक्के के आकार के पत्तों के लिए पसंद किया जाता है। इसे उगाना आसान है और यह किसी भी इनडोर स्थान के लिए एक आकर्षक जोड़ है।',
                    gu: 'પિલિયા પેપેરોમિઓઇડ્સ, જેને ચાઇનીઝ મની પ્લાન્ટ તરીકે પણ ઓળખવામાં આવે છે, તેના ગોળ, સિક્કા આકારના પાંદડાં માટે પ્રિય છે. તેને વધારવું સરળ છે અને કોઈપણ ઇનડોર સ્પેસમાં આકર્ષક ઉમેરો કરે છે.'
                }
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
                petFriendly: false,
                description: {
                    en: 'The Fiddle Leaf Fig is known for its large, violin-shaped leaves that create a dramatic silhouette. This popular houseplant requires consistent care but rewards with stunning vertical growth and statement presence.',
                    hi: 'फिडल लीफ फिग अपने बड़े, वायलिन के आकार के पत्ते होते हैं जिनका रंग समृद्ध, गहरा हरा होता है। यह उचित देखभाल के साथ एक शानदार इनडोर पेड़ में विकसित होता है और अपनी वायु-शुद्धिकरण क्षमताओं के लिए जाना जाता है।',
                    gu: 'ફિડલ લીફ ફિગ તેના મોટા, ચળકતા પાંદડાંથી ઓળખાય છે જેમાં સમૃદ્ધ, ઘાટા લીલા રંગના સ્ટ્રાઇપ પેટર્ન હોય છે. તેને ફૂલવા-ફાલવા માટે ઉચ્ચ ભેજ અને સાતત્યપૂર્ણ પાણીની જરૂર પડે છે, જે તેને સ્તબ્ધ કરી દે તેવું ઘરનું વૃક્ષ બનાવે છે.'
                }
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
                petFriendly: true,
                description: {
                    en: 'Basil is a fragrant culinary herb with bright green leaves that add fresh flavor to many dishes. Easy to grow indoors or outdoors, it thrives in sunny conditions and regular watering.',
                    hi: 'तुलसी एक सुगंधित रसोई जड़ी-बूटी है जिसके चमकीले हरे पत्ते कई व्यंजनों में ताजा स्वाद जोड़ते हैं। इनडोर या आउटडोर उगाने में आसान, यह धूप वाली स्थिति और नियमित पानी देने से फलता-फूलता है।',
                    gu: 'તુલસી એક સુગંધિત રસોડાની વનસ્પતિ છે જેના ચમકતા લીલા પાંદડા ઘણી વાનગીઓમાં તાજી સ્વાદ ઉમેરે છે. ઇનડોર અથવા આઉટડોર ઉગાડવામાં સરળ, તે તડકાની પરિસ્થિતિમાં અનુકૂલનક્ષમ, તેને શિખાઉ માટે આદર્શ પસંદગી બનાવે છે.'
                }
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
                petFriendly: true,
                description: {
                    en: 'Lavender is an aromatic perennial with stunning purple flowers and a distinctive fragrance. It prefers full sun and well-draining soil, making it perfect for sunny windowsills or outdoor gardens.',
                    hi: 'लैवेंडर एक सुगंधित बारहमासी पौधा है जिसमें शानदार बैंगनी फूल और एक विशिष्ट सुगंध होती है। इसे पूर्ण धूप और अच्छी जल निकासी वाली मिट्टी पसंद है, जिससे यह धूप वाली खिड़कियों या बाहरी बगीचों के लिए एकदम सही है।',
                    gu: 'લેવેન્ડર એક સુગંધિત બારમાસી છોડ છે જેમાં સ્તબ્ધ કરી દે તેવા જાંબલી ફૂલો અને એક અનોખી સુગંધ છે. તે સંપૂર્ણ સૂર્યપ્રકાશ અને પાણીનો નિકાલ કરતી માટીને પસંદ કરે છે, જે તેને તડકાની બારીઓ અથવા બહારના બગીચાઓ માટે સંપૂર્ણ બનાવે છે.'
                }
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
                petFriendly: false,
                description: {
                    en: 'Pothos is a versatile trailing plant with heart-shaped leaves that can be grown in water or soil. Extremely forgiving and adaptable to various light conditions, making it an ideal choice for beginners.',
                    hi: 'पोथोस एक बहुमुखी ट्रेलिंग प्लांट है जिसके दिल के आकार के पत्ते होते हैं जिन्हें पानी या मिट्टी में उगाया जा सकता है। विभिन्न प्रकाश स्थितियों के लिए अत्यंत माफी और अनुकूलनीय, इसे शुरुआती लोगों के लिए एक आदर्श विकल्प बनाता है।',
                    gu: 'પોથોસ એક બહુમુખી ટ્રેલિંગ છોડ છે જેના હૃદય આકારના પાંદડાં પાણી અથવા માટીમાં ઉગાડી શકાય છે. વિવિધ પ્રકાશની પરિસ્થિતિઓ માટે અત્યંત માફી આપનાર અને અનુકૂલનક્ષમ, તેને શિખાઉ માટે આદર્શ પસંદગી બનાવે છે.'
                }
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
                petFriendly: false,
                description: {
                    en: 'The Rubber Plant features large, glossy leaves with a rich, dark green color. It grows into a stunning indoor tree with proper care and is known for its air-purifying abilities.',
                    hi: 'रबर प्लांट में बड़े, चमकदार पत्ते होते हैं जिनका रंग समृद्ध, गहरा हरा होता है। यह उचित देखभाल के साथ एक शानदार इनडोर पेड़ में विकसित होता है और अपनी वायु-शुद्धिकरण क्षमताओं के लिए जाना जाता है।',
                    gu: 'રબર પ્લાન્ટમાં સમૃદ્ધ, ઘાટા લીલા રંગના મોટા, ચળકતા પાંદડાં હોય છે. તે યોગ્ય સંભાળ સાથે એક સ્તબ્ધ કરી દે તેવું ઘરનું વૃક્ષ બનાવે છે અને તેની હવા શુદ્ધિકરણ ક્ષમતાઓ માટે જાણીતું છે.'
                }
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
                petFriendly: false,
                description: {
                    en: 'The ZZ Plant is exceptionally hardy with shiny, dark green leaves that grow from thick stems. It can tolerate neglect, low light, and infrequent watering, making it perfect for busy people or office environments.',
                    hi: 'जेडजेड प्लांट अत्यधिक मजबूत होता है जिसमें चमकीले, गहरे हरे पत्ते होते हैं जो मोटे तनों से बढ़ते हैं। यह उपेक्षा, कम प्रकाश और कम पानी देने को सहन कर सकता है, जिससे यह व्यस्त लोगों या ऑफिस के वातावरण के लिए एकदम सही है।',
                    gu: 'ઝેડઝેડ પ્લાન્ટ ચળકતા, ઘાટા લીલા પાંદડાં સાથે અસાધારણ રીતે મજબૂત છે જે જાડા દાંડી પરથી ઉગે છે. તે અવગણના, ઓછા પ્રકાશ અને અવારનવાર પાણી આપવાનું સહન કરી શકે છે, જે તેને વ્યસ્ત લોકો અથવા ઓફિસના વાતાવરણ માટે સંપૂર્ણ બનાવે છે.'
                }
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
                petFriendly: true,
                description: {
                    en: 'Calathea Orbifolia is characterized by large, round leaves with striking silver and green striped patterns. It requires high humidity and consistent watering to thrive, making it a beautiful but somewhat demanding houseplant.',
                    hi: 'कैलाथिया ऑर्बिफोलिया को बड़े, गोल पत्तियों की विशेषता है जिनमें चांदी और हरे रंग के धारीदार पैटर्न होते हैं। इसे पनपने के लिए अधिक आर्द्रता और लगातार पानी की आवश्यकता होती है, जिससे यह एक सुंदर लेकिन कुछ हद तक मांग वाला हाउसप्लांट बन जाता है।',
                    gu: 'કેલેથિયા ઓર્બિફોલિયા મોટા, ગોળ પાંદડાંથી ઓળખાય છે જેમાં ચાંદી અને લીલા રંગના સ્ટ્રાઇપ પેટર્ન હોય છે. તેને ફૂલવા-ફાલવા માટે ઉચ્ચ ભેજ અને સાતત્યપૂર્ણ પાણીની જરૂર પડે છે, જે તેને સુંદર પરંતુ થોડી માંગ કરતો ઘરનો છોડ બનાવે છે.'
                }
            }
        ];

        const sampleReviews: Review[] = [
            {
                id: '1',
                username: 'PlantLover22',
                rating: 5,
                comment: 'Amazing plant! Arrived in perfect condition and has been thriving in my living room.',
                date: '2023-05-15'
            },
            {
                id: '2',
                username: 'GreenThumb',
                rating: 4,
                comment: 'Beautiful plant, good quality. Shipping was a bit slow but worth the wait.',
                date: '2023-04-30'
            },
            {
                id: '3',
                username: 'BotanyEnthusiast',
                rating: 4.5,
                comment: 'Healthy plant with vibrant leaves. The care instructions were very helpful.',
                date: '2023-05-10'
            }
        ];

        // Find the plant based on the ID from the URL
        const plantId = params?.id as string;
        const foundPlant = samplePlants.find(p => p.id === plantId);
        if (foundPlant) {
            setPlant(foundPlant);
            
            // Set related plants (plants in the same category)
            const related = samplePlants
                .filter(p => p.category === foundPlant.category && p.id !== foundPlant.id)
                .slice(0, 3); // Limit to 3 related plants
            setRelatedPlants(related);
            
            // Check if the action parameter is 'add-to-cart'
            const action = searchParams?.get('action');
            if (action === 'add-to-cart') {
                // We need to wait for the component to fully render before triggering the cart
                setTimeout(() => {
                    handleAddToCart();
                }, 500);
            }
        }

        // Check if the plant is already in the wishlist
        const wishlistJSON = localStorage.getItem('wishlist');
        if (wishlistJSON && foundPlant) {
            const wishlist: Plant[] = JSON.parse(wishlistJSON);
            setIsWishlisted(wishlist.some(p => p.id === foundPlant.id));
        }
        
        // Load sample reviews
        setReviews(sampleReviews);
    }, [params?.id, searchParams]);

    const handleImageError = () => {
        setImageError(true);
    };

    // Add a separate function for handling related plant image errors
    const handleRelatedImageError = (id: string) => {
        // In a real app, you would handle the image error state for each related plant
        console.log(`Image error for related plant: ${id}`);
    };

    const getPlantImage = () => {
        if (!plant) return '';
        if (imageError) {
            return plant.fallbackImage;
        }
        return plant.image;
    };

    const handleQuantityChange = (change: number) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= 10) {
            setQuantity(newQuantity);
        }
    };

    // Handle size change
    const handleSizeChange = (size: string) => {
        // Animation for price change
        const priceElement = document.querySelector('.price-change-indicator');
        if (priceElement) {
            priceElement.classList.remove('price-flash');
            // Trigger reflow to restart animation
            void (priceElement as HTMLElement).offsetWidth;
            priceElement.classList.add('price-flash');
        }
        
        setSelectedSize(size);
    };

    // Handle add to cart
    const handleAddToCart = () => {
        // Show review step first instead of direct confirmation
        setShowReviewStep(true);
    };
    
    // Confirm add to cart after review
    const confirmAddToCart = () => {
        // Close review step
        setShowReviewStep(false);
        
        if (!plant) return;
        
        // In a real app, you would add the item to cart in your state management or backend
        const cartItem: CartItem = {
            id: plant.id,
            name: plant.name,
            scientificName: plant.scientificName,
            price: getCurrentPrice(),
            image: getPlantImage(),
            size: selectedSize,
            quantity: quantity,
            giftWrapping: isGiftWrapping
        };
        
        // For now, we'll store it in localStorage
        try {
            const cartJSON = localStorage.getItem('cart');
            let cart: CartItem[] = [];
            
            if (cartJSON) {
                cart = JSON.parse(cartJSON);
            }
            
            // Check if same item is already in cart
            const existingItemIndex = cart.findIndex(item => 
                item.id === cartItem.id && item.size === cartItem.size
            );
            
            if (existingItemIndex !== -1) {
                // Update quantity if same item exists
                cart[existingItemIndex].quantity += cartItem.quantity;
            } else {
                // Add new item to cart
                cart.push(cartItem);
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Show confirmation modal
            setShowConfirmation(true);
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('There was an error adding this item to your cart. Please try again.');
        }
    };

    const handleProceedToCheckout = () => {
        // In a real app, you would redirect to checkout page
        router.push('/checkout');
    };

    const handleFindNurseries = () => {
        setShowNurseryFinder(true);
        setShowConfirmation(false);
        getUserLocation();
    };

    const getUserLocation = () => {
        setIsLoadingNurseries(true)
        setLocationError('')
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userCoords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                    setUserLocation(userCoords)
                    
                    // Navigate to nursery finder with plant info
                    if (plant) {
                        // Ensure we convert numbers to strings for URL parameters
                        const lat = userCoords.lat.toString();
                        const lng = userCoords.lng.toString();
                        const queryParams = new URLSearchParams({
                            plant: plant.name[locale as keyof typeof plant.name],
                            scientific: plant.scientificName,
                            lat,
                            lng
                        }).toString();
                        
                        console.log(`Navigating to nursery finder with coordinates: ${lat},${lng}`);
                        router.push(`/shop/nursery-finder?${queryParams}`);
                    } else {
                        setIsLoadingNurseries(false);
                    }
                },
                (error) => {
                    console.error('Error getting location:', error)
                    setLocationError('Unable to access your location. Please enable location services and try again.')
                    setIsLoadingNurseries(false)
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            )
        } else {
            setLocationError('Geolocation is not supported by your browser')
            setIsLoadingNurseries(false)
        }
    }

    const fetchNearbyNurseries = async (coords: {lat: number, lng: number}) => {
        try {
            // Call our API to get nearby nurseries
            const response = await fetch(`/api/nurseries?lat=${coords.lat}&lng=${coords.lng}`);
            if (!response.ok) {
                throw new Error('Failed to fetch nurseries');
            }
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || 'Error fetching nurseries');
            }
            
            setNearbyNurseries(result.data);
            setIsLoadingNurseries(false);
        } catch (error) {
            console.error('Error fetching nearby nurseries:', error);
            setLocationError('Failed to fetch nearby nurseries. Please try again.');
            setIsLoadingNurseries(false);
        }
    }

    const openDirections = (nurseryAddress: string) => {
        if (!userLocation) return
        
        const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(nurseryAddress)}&travelmode=driving`
        window.open(url, '_blank')
    }

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<FaStar key={i} className="text-yellow-400" />);
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
            } else {
                stars.push(<FaRegStar key={i} className="text-yellow-400" />);
            }
        }
        
        return stars;
    };

    const toggleWishlist = () => {
        const newWishlistState = !isWishlisted;
        setIsWishlisted(newWishlistState);
        
        // In a real app, you would call an API to add/remove from wishlist
        // For now, we'll use localStorage
        try {
            if (newWishlistState && plant) {
                // Add to wishlist
                const wishlistJSON = localStorage.getItem('wishlist');
                let wishlist: Plant[] = [];
                
                if (wishlistJSON) {
                    wishlist = JSON.parse(wishlistJSON);
                }
                
                // Check if plant is already in wishlist
                if (!wishlist.some(p => p.id === plant.id)) {
                    wishlist.push(plant);
                    localStorage.setItem('wishlist', JSON.stringify(wishlist));
                }
                
                alert('Added to your wishlist!');
            } else if (plant) {
                // Remove from wishlist
                const wishlistJSON = localStorage.getItem('wishlist');
                
                if (wishlistJSON) {
                    const wishlist: Plant[] = JSON.parse(wishlistJSON);
                    const updatedWishlist = wishlist.filter(p => p.id !== plant.id);
                    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
                }
            }
        } catch (error) {
            console.error('Error updating wishlist:', error);
        }
    };

    const handleShare = () => {
        setShowShareOptions(!showShareOptions);
    };

    const shareVia = (platform: string) => {
        if (!plant) return;
        
        const url = window.location.href;
        const title = `Check out this ${plant.name[locale as keyof typeof plant.name]} on PlantIdentifier!`;
        
        let shareUrl = '';
        
        switch(platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank');
        }
        
        setShowShareOptions(false);
    };

    const toggleGiftWrapping = () => {
        setIsGiftWrapping(!isGiftWrapping);
    };

    if (!plant) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <p>Loading plant details...</p>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#f0faf0]">
            <Navbar />
            
            {/* Add style tag for animation */}
            <style jsx global>{priceChangeAnimation}</style>
            
            <main className="flex-grow container mx-auto px-4 py-8">
                {/* Back button */}
                <Link href="/shop" className="flex items-center text-[#2e7d32] hover:text-[#22c55e] mb-6">
                    <BiArrowBack className="mr-2" />
                    <span>Back to Shop</span>
                </Link>
                
                <div className="bg-white rounded-xl shadow-md overflow-hidden md:flex border border-[#e0f0e0]">
                    {/* Plant Image */}
                    <div className="md:w-1/2 h-96 relative">
                        <Image
                            src={getPlantImage()}
                            alt={plant.name[locale as keyof typeof plant.name]}
                            fill
                            className="object-cover"
                            onError={handleImageError}
                        />
                        {plant.petFriendly && (
                            <div className="absolute top-4 right-4 bg-[#22c55e] text-white px-3 py-1 rounded-full text-sm">
                                Pet Friendly
                            </div>
                        )}
                        
                        {/* Wishlist and Share buttons */}
                        <div className="absolute top-4 left-4 flex gap-2">
                            <button 
                                onClick={toggleWishlist}
                                className="bg-white p-2 rounded-full shadow-md hover:bg-[#f8f8f8] transition-colors"
                                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                {isWishlisted ? (
                                    <FaHeart className="text-red-500 text-xl" />
                                ) : (
                                    <FaRegHeart className="text-gray-600 text-xl" />
                                )}
                            </button>
                            <div className="relative">
                                <button 
                                    onClick={handleShare}
                                    className="bg-white p-2 rounded-full shadow-md hover:bg-[#f8f8f8] transition-colors"
                                    aria-label="Share this plant"
                                >
                                    <FaShare className="text-gray-600 text-xl" />
                                </button>
                                
                                {showShareOptions && (
                                    <div className="absolute left-0 top-12 bg-white rounded-lg shadow-lg p-3 z-10 w-40 border border-gray-200">
                                        <button 
                                            onClick={() => shareVia('facebook')}
                                            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded w-full text-left"
                                        >
                                            <span className="text-blue-600">f</span>
                                            <span>Facebook</span>
                                        </button>
                                        <button 
                                            onClick={() => shareVia('twitter')}
                                            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded w-full text-left"
                                        >
                                            <span className="text-blue-400">t</span>
                                            <span>Twitter</span>
                                        </button>
                                        <button 
                                            onClick={() => shareVia('whatsapp')}
                                            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded w-full text-left"
                                        >
                                            <span className="text-green-500">w</span>
                                            <span>WhatsApp</span>
                                        </button>
                                        <button 
                                            onClick={() => shareVia('email')}
                                            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded w-full text-left"
                                        >
                                            <span className="text-gray-600">@</span>
                                            <span>Email</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Plant Details */}
                    <div className="md:w-1/2 p-6 md:p-8">
                        <h1 className="text-2xl font-bold text-[#2e7d32] mb-2">
                            {plant.name[locale as keyof typeof plant.name]}
                        </h1>
                        <p className="text-gray-600 italic mb-4">{plant.scientificName}</p>
                        
                        <div className="flex items-center mb-4">
                            <div className="flex mr-2">
                                {renderStars(4.5)}
                            </div>
                            <span className="text-gray-600 text-sm">(36 reviews)</span>
                        </div>
                        
                        <p className="text-2xl font-bold text-[#22c55e] mb-6 price-change-indicator">₹{(getCurrentPrice() * rupeeConversionRate).toFixed(0)}</p>
                        
                        {/* Delivery Information */}
                        <div className="mb-6 bg-[#f8fdf8] p-4 rounded-lg border border-[#e0f0e0]">
                            <h3 className="font-semibold text-[#2e7d32] mb-3">Delivery Information:</h3>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <FaTruck className="text-[#22c55e] mr-2" />
                                    <span className="text-gray-700">Free shipping on orders over ₹3750</span>
                                </div>
                                <div className="flex items-center">
                                    <FaCalendarCheck className="text-[#22c55e] mr-2" />
                                    <span className="text-gray-700">Delivery in 3-5 business days</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <h3 className="font-semibold text-[#2e7d32] mb-2">Care Information:</h3>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="bg-[#f0faf0] p-2 rounded text-center border border-[#e0f0e0]">
                                    <span className="block text-gray-500">Difficulty</span>
                                    <span className="font-medium text-gray-700">{plant.difficulty}</span>
                                </div>
                                <div className="bg-[#f0faf0] p-2 rounded text-center border border-[#e0f0e0]">
                                    <span className="block text-gray-500">Light</span>
                                    <span className="font-medium text-gray-700">{plant.light}</span>
                                </div>
                                <div className="bg-[#f0faf0] p-2 rounded text-center border border-[#e0f0e0]">
                                    <span className="block text-gray-500">Water</span>
                                    <span className="font-medium text-gray-700">{plant.water}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            {/* Size Selection */}
                            <div className="mb-4">
                                <h3 className="font-semibold text-[#2e7d32] mb-2">Select Size:</h3>
                                <div className="flex space-x-3">
                                    <button 
                                        className={`border rounded-md py-2 px-4 ${selectedSize === 'small' 
                                            ? 'bg-[#22c55e] text-white border-[#22c55e]' 
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#22c55e]'
                                        }`}
                                        onClick={() => handleSizeChange('small')}
                                    >
                                        Small
                                        <span className="block text-xs mt-1">{selectedSize === 'small' ? 'Selected' : `-${((1-sizePriceMultipliers.small)*100).toFixed(0)}%`}</span>
                                    </button>
                                    <button 
                                        className={`border rounded-md py-2 px-4 ${selectedSize === 'medium' 
                                            ? 'bg-[#22c55e] text-white border-[#22c55e]' 
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#22c55e]'
                                        }`}
                                        onClick={() => handleSizeChange('medium')}
                                    >
                                        Medium
                                        <span className="block text-xs mt-1">{selectedSize === 'medium' ? 'Selected' : 'Base Price'}</span>
                                    </button>
                                    <button 
                                        className={`border rounded-md py-2 px-4 ${selectedSize === 'large' 
                                            ? 'bg-[#22c55e] text-white border-[#22c55e]' 
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#22c55e]'
                                        }`}
                                        onClick={() => handleSizeChange('large')}
                                    >
                                        Large
                                        <span className="block text-xs mt-1">{selectedSize === 'large' ? 'Selected' : `+${((sizePriceMultipliers.large-1)*100).toFixed(0)}%`}</span>
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">* Price varies by size selection</p>
                            </div>
                            
                            <div className="flex items-center mb-4">
                                <span className="mr-4 text-[#2e7d32] font-medium text-lg">Quantity:</span>
                                <button 
                                    onClick={() => handleQuantityChange(-1)}
                                    className="w-10 h-10 bg-[#22c55e] rounded-full flex items-center justify-center text-white border border-[#22c55e] text-xl font-bold shadow-sm hover:bg-[#1ea550] transition-colors"
                                >
                                    -
                                </button>
                                <span className="mx-4 text-center w-8 text-xl font-bold text-gray-900">{quantity}</span>
                                <button 
                                    onClick={() => handleQuantityChange(1)}
                                    className="w-10 h-10 bg-[#22c55e] rounded-full flex items-center justify-center text-white border border-[#22c55e] text-xl font-bold shadow-sm hover:bg-[#1ea550] transition-colors"
                                >
                                    +
                                </button>
                            </div>
                            
                            {/* Gift Wrapping Option */}
                            <div className="mb-4 flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="giftWrap" 
                                    checked={isGiftWrapping}
                                    onChange={toggleGiftWrapping}
                                    className="w-4 h-4 text-[#22c55e] rounded border-gray-300 focus:ring-[#22c55e]"
                                />
                                <label htmlFor="giftWrap" className="ml-2 text-gray-700">
                                    Add gift wrapping (+₹99)
                                </label>
                            </div>
                            
                            <button 
                                ref={addToCartRef}
                                onClick={handleAddToCart}
                                className="w-full bg-[#22c55e] hover:bg-[#1ea550] text-white py-4 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 shadow-md text-lg"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Tabs */}
                <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden border border-[#e0f0e0]">
                    <div className="flex border-b border-[#e0f0e0]">
                        <button 
                            className={`px-6 py-3 font-medium ${activeTab === 'description' ? 'text-[#22c55e] border-b-2 border-[#22c55e] bg-[#f5fbf5]' : 'text-gray-600 hover:bg-[#f5fbf5]'}`}
                            onClick={() => setActiveTab('description')}
                        >
                            Description
                        </button>
                        <button 
                            className={`px-6 py-3 font-medium ${activeTab === 'reviews' ? 'text-[#22c55e] border-b-2 border-[#22c55e] bg-[#f5fbf5]' : 'text-gray-600 hover:bg-[#f5fbf5]'}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Reviews ({reviews.length})
                        </button>
                    </div>
                    
                    <div className="p-6">
                        {activeTab === 'description' && (
                            <div>
                                <p className="text-gray-700">
                                    {plant.description ? plant.description[locale as keyof typeof plant.description] : 
                                    'No description available for this plant.'}
                                </p>
                            </div>
                        )}
                        
                        {activeTab === 'reviews' && (
                            <div>
                                {reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {reviews.map(review => (
                                            <div key={review.id} className="border-b border-[#e0f0e0] pb-4">
                                                <div className="flex justify-between mb-2">
                                                    <span className="font-medium text-[#2e7d32]">{review.username}</span>
                                                    <span className="text-gray-500 text-sm">{review.date}</span>
                                                </div>
                                                <div className="flex mb-2">
                                                    {renderStars(review.rating)}
                                                </div>
                                                <p className="text-gray-700">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No reviews yet for this plant.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Related Products */}
                {relatedPlants.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-[#2e7d32] mb-6">You May Also Like</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {relatedPlants.map((relatedPlant) => (
                                <Link href={`/shop/${relatedPlant.id}`} key={relatedPlant.id} className="block">
                                    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-[#e0f0e0]">
                                        <div className="relative h-48 overflow-hidden">
                                            <Image
                                                src={relatedPlant.image}
                                                alt={relatedPlant.name[locale as keyof typeof relatedPlant.name]}
                                                width={300}
                                                height={300}
                                                className="w-full h-full object-cover"
                                                onError={() => handleRelatedImageError(relatedPlant.id)}
                                            />
                                            {relatedPlant.petFriendly && (
                                                <div className="absolute top-3 right-3 bg-[#22c55e] text-white text-xs px-2 py-1 rounded-full">
                                                    Pet Friendly
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="p-4">
                                            <h3 className="font-semibold text-[#2e7d32]">{relatedPlant.name[locale as keyof typeof relatedPlant.name]}</h3>
                                            <p className="text-sm text-gray-500 italic">{relatedPlant.scientificName}</p>
                                            <div className="mt-2">
                                                <span className="font-bold text-[#22c55e]">₹{(relatedPlant.price * rupeeConversionRate).toFixed(0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>
            
            <Footer />
            
            {/* Review Step Modal */}
            {showReviewStep && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-[#2e7d32]">Review Your Selection</h2>
                            <button 
                                onClick={() => setShowReviewStep(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="flex items-start mb-6">
                            <div className="w-24 h-24 relative mr-4 border border-[#e0f0e0] rounded overflow-hidden">
                                <Image
                                    src={getPlantImage()}
                                    alt={plant.name[locale as keyof typeof plant.name]}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-[#2e7d32] text-lg">{plant.name[locale as keyof typeof plant.name]}</h3>
                                <p className="text-gray-600 italic text-sm">{plant.scientificName}</p>
                                
                                <div className="mt-2 text-sm text-gray-700">
                                    <p><span className="font-medium">Size:</span> {selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1)}</p>
                                    <p><span className="font-medium">Quantity:</span> {quantity}</p>
                                    <p><span className="font-medium">Gift Wrapping:</span> {isGiftWrapping ? 'Yes (+₹99)' : 'No'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <h3 className="font-semibold text-[#2e7d32] mb-2">Plant Details</h3>
                            <div className="bg-[#f8fdf8] p-4 rounded-lg border border-[#e0f0e0] text-sm">
                                <p className="mb-2">{plant.description ? plant.description[locale as keyof typeof plant.description] : 'No description available for this plant.'}</p>
                                
                                <div className="grid grid-cols-3 gap-2 mt-3">
                                    <div className="bg-[#f0faf0] p-2 rounded text-center border border-[#e0f0e0]">
                                        <span className="block text-gray-500">Difficulty</span>
                                        <span className="font-medium text-gray-700">{plant.difficulty}</span>
                                    </div>
                                    <div className="bg-[#f0faf0] p-2 rounded text-center border border-[#e0f0e0]">
                                        <span className="block text-gray-500">Light</span>
                                        <span className="font-medium text-gray-700">{plant.light}</span>
                                    </div>
                                    <div className="bg-[#f0faf0] p-2 rounded text-center border border-[#e0f0e0]">
                                        <span className="block text-gray-500">Water</span>
                                        <span className="font-medium text-gray-700">{plant.water}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="border-t border-b border-[#e0f0e0] py-4 mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Price:</span>
                                <span className="font-medium">₹{(getCurrentPrice() * rupeeConversionRate).toFixed(0)} × {quantity}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">₹{(getCurrentPrice() * quantity * rupeeConversionRate).toFixed(0)}</span>
                            </div>
                            {isGiftWrapping && (
                                <div className="flex justify-between mt-2">
                                    <span className="text-gray-600">Gift Wrapping:</span>
                                    <span className="font-medium">₹99</span>
                                </div>
                            )}
                            <div className="flex justify-between mt-2 font-bold">
                                <span className="text-gray-700">Total:</span>
                                <span className="text-[#22c55e]">
                                    ₹{(getCurrentPrice() * quantity * rupeeConversionRate + (isGiftWrapping ? 99 : 0)).toFixed(0)}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowReviewStep(false)}
                                className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                            >
                                Edit Selection
                            </button>
                            <button 
                                onClick={confirmAddToCart}
                                className="flex-1 py-3 bg-[#22c55e] text-white rounded-lg hover:bg-[#1ea550] transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Confirm Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Add to Cart Confirmation */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#2e7d32]">Added to Cart!</h3>
                            <p className="text-gray-600 mt-1">Your plant has been added to your shopping cart.</p>
                        </div>
                        
                        <div className="flex items-start mb-6 bg-[#f9f9f9] p-3 rounded-lg">
                            <div className="w-20 h-20 relative mr-4 border border-[#e0f0e0] rounded overflow-hidden">
                                <Image
                                    src={getPlantImage()}
                                    alt={plant.name[locale as keyof typeof plant.name]}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-[#2e7d32]">{plant.name[locale as keyof typeof plant.name]}</h3>
                                <p className="text-gray-600 text-sm">Size: {selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1)}</p>
                                <p className="text-gray-600 text-sm">Quantity: {quantity}</p>
                                <p className="text-[#22c55e] font-medium mt-1">₹{(getCurrentPrice() * quantity * rupeeConversionRate).toFixed(0)}</p>
                            </div>
                        </div>
                        
                        <div className="border-t border-b border-[#e0f0e0] py-4 mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">₹{(getCurrentPrice() * quantity * rupeeConversionRate).toFixed(0)}</span>
                            </div>
                            {isGiftWrapping && (
                                <div className="flex justify-between mt-2">
                                    <span className="text-gray-600">Gift Wrapping:</span>
                                    <span className="font-medium">₹99</span>
                                </div>
                            )}
                            <div className="flex justify-between mt-2 font-bold">
                                <span className="text-gray-700">Total:</span>
                                <span className="text-[#22c55e]">
                                    ₹{(getCurrentPrice() * quantity * rupeeConversionRate + (isGiftWrapping ? 99 : 0)).toFixed(0)}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex flex-col space-y-3">
                            <button 
                                onClick={handleProceedToCheckout}
                                className="w-full py-3 bg-[#22c55e] text-white rounded-lg hover:bg-[#1ea550] transition-colors font-medium"
                            >
                                Proceed to Checkout
                            </button>
                            <button 
                                onClick={handleFindNurseries}
                                className="w-full py-3 bg-[#e6f2fd] text-[#0057b7] rounded-lg hover:bg-[#d6e8f9] transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                <FaMapMarkerAlt /> 
                                Find Nearby Nurseries
                            </button>
                            <button 
                                onClick={() => setShowConfirmation(false)}
                                className="w-full py-3 border border-[#c8e6c9] rounded-lg text-[#2e7d32] hover:bg-[#f5fbf5] transition-colors font-medium"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Nursery Finder Modal */}
            {showNurseryFinder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-[#2e7d32] flex items-center gap-2">
                                <FaStore className="text-[#22c55e]" />
                                Nearby Plant Nurseries
                            </h2>
                            <button 
                                onClick={() => setShowNurseryFinder(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {locationError && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                                <p>{locationError}</p>
                                <button 
                                    onClick={getUserLocation}
                                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {isLoadingNurseries ? (
                            <div className="py-20 text-center">
                                <svg className="w-12 h-12 mx-auto text-[#22c55e] animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="mt-4 text-gray-600">Finding nurseries near you...</p>
                            </div>
                        ) : nearbyNurseries.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {nearbyNurseries.map(nursery => (
                                    <div key={nursery.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="relative h-48">
                                            <Image
                                                src={nursery.image}
                                                alt={nursery.name}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-medium flex items-center shadow-sm">
                                                <div className="flex mr-1">
                                                    {renderStars(nursery.rating)}
                                                </div>
                                                <span>{nursery.rating}</span>
                                            </div>
                                            <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-medium shadow-sm text-gray-700">
                                                {nursery.distance}
                                            </div>
                                            {nursery.openNow ? (
                                                <div className="absolute bottom-2 right-2 bg-[#22c55e] px-2 py-1 rounded-full text-xs font-medium shadow-sm text-white">
                                                    Open Now
                                                </div>
                                            ) : (
                                                <div className="absolute bottom-2 right-2 bg-red-500 px-2 py-1 rounded-full text-xs font-medium shadow-sm text-white">
                                                    Closed
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-lg text-[#2e7d32]">{nursery.name}</h3>
                                            <p className="text-gray-600 text-sm mt-1">{nursery.address}</p>
                                            
                                            <div className="mt-4 grid grid-cols-2 gap-2">
                                                <a 
                                                    href={`tel:${nursery.phone}`}
                                                    className="bg-[#f0faf0] text-[#2e7d32] px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    Call
                                                </a>
                                                <button 
                                                    onClick={() => openDirections(nursery.address)}
                                                    className="bg-[#22c55e] text-white px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                    </svg>
                                                    Directions
                                                </button>
                                            </div>
                                            
                                            {nursery.website && (
                                                <a 
                                                    href={nursery.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-2 text-blue-600 hover:underline text-sm block text-center"
                                                >
                                                    Visit Website
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center">
                                <p className="text-gray-600">No nurseries found nearby. Try expanding your search area.</p>
                            </div>
                        )}
                        
                        <div className="mt-6 flex justify-end">
                            <button 
                                onClick={() => setShowNurseryFinder(false)}
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 