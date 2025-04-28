'use client'

import { useRouter } from 'next/navigation'
import { useLanguage } from './context/languagecontext'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import AuthModal from '../app/components/authmodel'
import Footer from './components/Footer'
import LanguageSwitcher from './components/languageswitcher'

export default function Dashboard() {
  const router = useRouter()
  const { translations, locale } = useLanguage()
  const [imageError, setImageError] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  // Dashboard translations
  const dashboardText = {
    en: {
      title: 'Identify Any Plant',
      subtitle: 'In Seconds',
      description: 'Take a photo of any plant and instantly get accurate identification, care tips, and shopping options. Your personal botanist in your pocket.',
      identifyButton: 'Identify Plant',
      shopButton: 'Shop Plants',
      trustedText: 'Trusted by plant lovers worldwide',
      features: 'Features',
      howItWorks: 'How It Works',
      about: 'About',
      getStarted: 'Get Started',
      testimonials: 'Testimonials',
      featuresTitle: 'Amazing Features',
      featuresSubtitle: 'Discover what makes our plant identifier special',
      howItWorksTitle: 'How It Works',
      howItWorksSubtitle: 'Simple steps to identify any plant',
      faqTitle: 'Frequently Asked Questions',
      faqSubtitle: 'Find answers to common questions',
      aboutTitle: 'About PlantIDentifier',
      aboutSubtitle: 'Our mission is to connect people with the plant world',
      aboutContent: 'PlantIDentifier was created by a team of botanists, developers, and plant enthusiasts who wanted to make plant identification accessible to everyone. Our advanced AI technology has been trained on millions of plant images to provide accurate identification within seconds.',
      aboutVision: 'Our vision is to foster a deeper connection between people and the natural world by making plant knowledge accessible to everyone.'
    },
    hi: {
      title: 'किसी भी पौधे की पहचान करें',
      subtitle: 'सेकंडों में',
      description: 'किसी भी पौधे की तस्वीर लें और तुरंत सटीक पहचान, देखभाल टिप्स और खरीदारी विकल्प प्राप्त करें। आपकी जेब में आपका निजी वनस्पतिशास्त्री।',
      identifyButton: 'पौधे की पहचान करें',
      shopButton: 'पौधे खरीदें',
      trustedText: 'दुनिया भर के पौधों के प्रेमियों द्वारा विश्वसनीय',
      features: 'विशेषताएँ',
      howItWorks: 'यह कैसे काम करता है',
      about: 'हमारे बारे में',
      getStarted: 'शुरू करें',
      testimonials: 'प्रशंसापत्र',
      featuresTitle: 'अद्भुत विशेषताएँ',
      featuresSubtitle: 'जानें कि हमारा पौधा पहचानकर्ता क्यों विशेष है',
      howItWorksTitle: 'यह कैसे काम करता है',
      howItWorksSubtitle: 'किसी भी पौधे की पहचान करने के सरल चरण',
      faqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
      faqSubtitle: 'सामान्य प्रश्नों के उत्तर प्राप्त करें',
      aboutTitle: 'प्लांट आईडेंटिफायर के बारे में',
      aboutSubtitle: 'हमारा मिशन लोगों को पौधों की दुनिया से जोड़ना है',
      aboutContent: 'प्लांट आईडेंटिफायर वनस्पतिशास्त्रियों, डेवलपर्स और पौधों के शौकीनों की एक टीम द्वारा बनाया गया था, जो पौधों की पहचान को सभी के लिए सुलभ बनाना चाहते थे। हमारी उन्नत एआई तकनीक को लाखों पौधों की छवियों पर प्रशिक्षित किया गया है ताकि सेकंडों के भीतर सटीक पहचान प्रदान की जा सके।',
      aboutVision: 'हमारा दृष्टिकोण पौधों के ज्ञान को सभी के लिए सुलभ बनाकर लोगों और प्राकृतिक दुनिया के बीच गहरे संबंध को बढ़ावा देना है।'
    },
    gu: {
      title: 'કોઈપણ છોડની ઓળખ કરો',
      subtitle: 'સેકન્ડોમાં',
      description: 'કોઈપણ છોડનો ફોટો લો અને તરત જ સચોટ ઓળખ, સંભાળ ટિપ્સ અને ખરીદી વિકલ્પો મેળવો. તમારા ખિસ્સામાં તમારો અંગત વનસ્પતિશાસ્ત્રી.',
      identifyButton: 'છોડની ઓળખ કરો',
      shopButton: 'છોડ ખરીદો',
      trustedText: 'વિશ્વભરના છોડ પ્રેમીઓ દ્વારા વિશ્વસનીય',
      features: 'વિશેષતાઓ',
      howItWorks: 'આ કેવી રીતે કામ કરે છે',
      about: 'અમારા વિશે',
      getStarted: 'શરૂ કરો',
      testimonials: 'પ્રશંસાપત્રો',
      featuresTitle: 'અદ્ભુત વિશેષતાઓ',
      featuresSubtitle: 'જાણો કે અમારો છોડ ઓળખનાર શા માટે ખાસ છે',
      howItWorksTitle: 'આ કેવી રીતે કામ કરે છે',
      howItWorksSubtitle: 'કોઈપણ છોડને ઓળખવા માટેના સરળ પગલાં',
      faqTitle: 'વારંવાર પૂછાતા પ્રશ્નો',
      faqSubtitle: 'સામાન્ય પ્રશ્નોના જવાબો શોધો',
      aboutTitle: 'પ્લાન્ટ આઈડેન્ટિફાયર વિશે',
      aboutSubtitle: 'અમારું મિશન લોકોને વનસ્પતિ જગત સાથે જોડવાનું છે',
      aboutContent: 'પ્લાન્ટ આઈડેન્ટિફાયર વનસ્પતિશાસ્ત્રીઓ, ડેવલપર્સ અને છોડના શોખીનોની ટીમ દ્વારા બનાવવામાં આવ્યું હતું, જેઓ છોડની ઓળખને દરેક માટે સુલભ બનાવવા માંગતા હતા. અમારી અદ્યતન AI તકનીકને લાખો છોડના ચિત્રો પર તાલીમ આપવામાં આવી છે જેથી સેકન્ડોમાં ચોક્કસ ઓળખ પ્રદાન કરી શકાય.',
      aboutVision: 'અમારું વિઝન છોડનું જ્ઞાન દરેકને સુલભ બનાવીને લોકો અને કુદરતી જગત વચ્ચે ઊંડો સંબંધ કેળવવાનો છે.'
    }
  }

  const t = dashboardText[locale as keyof typeof dashboardText] || dashboardText.en

  // Setup smooth scrolling
  useEffect(() => {
    const handleSmoothScroll = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = target.getAttribute('href')?.substring(1);
        const targetElement = document.getElementById(targetId as string);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    document.addEventListener('click', handleSmoothScroll);

    return () => {
      document.removeEventListener('click', handleSmoothScroll);
    };
  }, []);

  const handleGetStarted = () => {
    router.push('/auth')
  }

  // Feature cards data
  const features = [
    {
      title: 'Instant Identification',
      description: 'Get accurate plant identification in seconds with our advanced AI technology',
      icon: (
        <svg className="w-12 h-12 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      title: 'Care Instructions',
      description: 'Get detailed care tips for watering, sunlight, soil, and more for your identified plants',
      icon: (
        <svg className="w-12 h-12 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      title: 'Shop Plants',
      description: 'Find and purchase the plants you love directly through our integrated marketplace',
      icon: (
        <svg className="w-12 h-12 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      title: 'Multi-language Support',
      description: 'Use our app in your preferred language with our multi-language support feature',
      icon: (
        <svg className="w-12 h-12 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      )
    }
  ]

  // How it works steps
  const steps = [
    {
      number: '1',
      title: 'Take a Photo',
      description: 'Snap a clear photo of any plant you want to identify',
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      number: '2',
      title: 'Get Instant Results',
      description: 'Our AI identifies the plant and provides detailed information',
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      number: '3',
      title: 'Learn & Shop',
      description: 'Learn how to care for your plant or shop for similar plants',
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    }
  ]

  // Testimonials data
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Garden Enthusiast',
      text: 'This app is a game changer! I was able to identify all the mysterious plants in my new garden and get proper care instructions.',
      avatar: '/images/avatars/avatar-1.jpg'
    },
    {
      name: 'Michael Chen',
      role: 'Botany Student',
      text: 'As a botany student, this tool has been invaluable for my field studies. The accuracy is impressive!',
      avatar: '/images/avatars/avatar-2.jpg'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Interior Designer',
      text: 'I use this app to recommend plants to my clients. The detailed care information helps them keep their new plants thriving.',
      avatar: '/images/avatars/avatar-3.jpg'
    }
  ]

  // FAQ data
  const faqs = [
    {
      question: 'How accurate is the plant identification?',
      answer: 'Our plant identification system is highly accurate with success rates above 95% for common plants. The AI model is continuously trained on new plant species to improve accuracy.'
    },
    {
      question: 'Do I need to create an account to use the app?',
      answer: 'You can identify a limited number of plants without an account. Creating an account gives you unlimited identifications, saved history, and access to detailed care guides.'
    },
    {
      question: 'How do I take the best photo for identification?',
      answer: 'For best results, take a clear, well-lit photo of the plant\'s leaves, flowers, or overall structure. Try to avoid shadows and make sure the plant is the focus of the image.'
    },
    {
      question: 'Is the app available worldwide?',
      answer: 'Yes! Our app is available globally and supports multiple languages.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#f0faf0]">
      {/* Header */}
      <header className="py-4 px-6 md:px-12 sticky top-0 bg-[#f0faf0] z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#22c55e] flex items-center justify-center mr-2">
              <div className="w-8 h-8 rounded-full border-2 border-white"></div>
            </div>
            <span className="text-2xl font-bold text-[#22c55e]">PlantIDentifier</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-[#2e7d32] hover:text-[#22c55e] transition-colors">
              {t.features}
            </a>
            <a href="#how-it-works" className="text-[#2e7d32] hover:text-[#22c55e] transition-colors">
              {t.howItWorks}
            </a>
            <a href="#about" className="text-[#2e7d32] hover:text-[#22c55e] transition-colors">
              {t.about}
            </a>
            <LanguageSwitcher />
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="md:hidden">
              <LanguageSwitcher />
            </div>
            <Link 
              href="/auth"
              className="bg-[#22c55e] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#1ea550] transition-colors"
            >
              {t.getStarted}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="py-16 px-6 md:px-12">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-[#2e7d32] leading-tight">
                {t.title} <br />
                <span className="text-[#22c55e]">{t.subtitle}</span>
              </h1>
              <p className="mt-6 text-lg text-gray-700 max-w-lg">
                {t.description}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/identify"
                  prefetch={true}
                  className="bg-[#22c55e] text-white px-6 py-3 rounded-lg shadow-lg hover:bg-[#1ea550] transition-colors font-medium text-lg flex items-center justify-center"
                >
                  {t.identifyButton}
                </Link>
                
                <Link
                  href="/shop"
                  className="bg-white text-[#22c55e] border border-[#22c55e] px-6 py-3 rounded-lg shadow-lg hover:bg-[#f0fdf4] transition-colors font-medium text-lg flex items-center justify-center"
                >
                  {t.shopButton}
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto">
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                  
                    <Image 
                      src="/images/plants/monstera-deliciosa.jpg" 
                      alt="Monstera Deliciosa" 
                      width={400} 
                      height={400} 
                      className="w-full h-full object-cover"
                      
                    />
                  
                </div>
                
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-[#e8f5e9] rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Monstera Deliciosa</h3>
                    <p className="text-sm text-gray-500">Swiss Cheese Plant</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="bg-[#f0faf0] p-2 rounded">
                    <p className="text-gray-600">Water</p>
                    <p className="font-medium text-[#22c55e]">Weekly</p>
                  </div>
                  <div className="bg-[#f0faf0] p-2 rounded">
                    <p className="text-gray-600">Light</p>
                    <p className="font-medium text-[#22c55e]">Indirect</p>
                  </div>
                  <div className="bg-[#f0faf0] p-2 rounded">
                    <p className="text-gray-600">Difficulty</p>
                    <p className="font-medium text-[#22c55e]">Easy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Trusted By Section */}
        <section className="py-12 text-center">
          <h2 className="text-2xl font-semibold text-[#2e7d32]">{t.trustedText}</h2>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-6 md:px-12 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#2e7d32]">{t.featuresTitle}</h2>
              <p className="mt-4 text-lg text-gray-600">{t.featuresSubtitle}</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-[#f0faf0] p-6 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-[#2e7d32] mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 px-6 md:px-12 bg-[#e8f5e9]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#2e7d32]">{t.howItWorksTitle}</h2>
              <p className="mt-4 text-lg text-gray-600">{t.howItWorksSubtitle}</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-[#22c55e] flex items-center justify-center mb-6 mx-auto">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-[#2e7d32] mb-2 text-center">{step.title}</h3>
                  <p className="text-gray-600 text-center">{step.description}</p>
                  
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-[#22c55e] transform -translate-x-1/2 z-0">
                      <div className="w-4 h-4 rounded-full bg-[#22c55e] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 px-6 md:px-12 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#2e7d32]">{t.testimonials}</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-[#f0faf0] p-6 rounded-xl">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-3">
                      {!imageError ? (
                        <Image 
                          src={testimonial.avatar} 
                          alt={testimonial.name} 
                          width={48} 
                          height={48} 
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#22c55e] text-white font-bold">
                          {testimonial.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#2e7d32]">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 px-6 md:px-12 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#2e7d32]">{t.aboutTitle}</h2>
              <p className="mt-4 text-lg text-gray-600">{t.aboutSubtitle}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <p className="text-lg text-gray-700 mb-6">
                  {t.aboutContent}
                </p>
                <p className="text-lg text-gray-700 italic">
                  {t.aboutVision}
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-[#f0faf0] p-4 rounded-lg">
                    <div className="text-3xl font-bold text-[#22c55e] mb-2">5M+</div>
                    <div className="text-gray-600">Plants Identified</div>
                  </div>
                  <div className="bg-[#f0faf0] p-4 rounded-lg">
                    <div className="text-3xl font-bold text-[#22c55e] mb-2">1M+</div>
                    <div className="text-gray-600">Happy Users</div>
                  </div>
                  <div className="bg-[#f0faf0] p-4 rounded-lg">
                    <div className="text-3xl font-bold text-[#22c55e] mb-2">10K+</div>
                    <div className="text-gray-600">Plant Species</div>
                  </div>
                  <div className="bg-[#f0faf0] p-4 rounded-lg">
                    <div className="text-3xl font-bold text-[#22c55e] mb-2">98%</div>
                    <div className="text-gray-600">Accuracy Rate</div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="relative">
                  {!imageError ? (
                    <Image 
                      src="/images/about-team.jpg" 
                      alt="Our team" 
                      width={600} 
                      height={400} 
                      className="rounded-xl shadow-lg w-full h-auto"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full aspect-video rounded-xl bg-[#e8f5e9] flex items-center justify-center">
                      <svg className="w-24 h-24 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute -bottom-6 -right-6 bg-[#22c55e] text-white p-4 rounded-lg">
                    <p className="font-bold">Founded in 2022</p>
                    <p>By plant enthusiasts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 px-6 md:px-12 bg-[#e8f5e9]">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#2e7d32]">{t.faqTitle}</h2>
              <p className="mt-4 text-lg text-gray-600">{t.faqSubtitle}</p>
            </div>
            
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold text-[#2e7d32] mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 md:px-12 bg-[#22c55e] text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to identify your plants?</h2>
            <p className="text-xl mb-8">Join thousands of plant enthusiasts using our app every day</p>
            <Link
              href="/auth"
              className="bg-white text-[#22c55e] px-8 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors text-lg inline-block"
            >
              Get Started Now
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}