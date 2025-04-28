'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

const translations = {
  en: {
    home: {
      title: 'Plant Identifier',
      subtitle: 'Upload an image or take a photo of a plant to identify it'
    },
    loading: {
      identifying: 'Identifying your plant',
      analyzing: 'Our AI is analyzing your plant\'s characteristics',
      videoLoading: 'Finding care guide videos...'
    },
    video: {
      title: 'Complete Care Guide for {plantName}',
      description: 'Learn everything about growing and caring for your {plantName}',
      channel: 'Channel',
      languageFallback: 'Video not available in {preferredLanguage}. Showing {availableLanguage} version.',
      noVideo: 'No care guide video available for this plant',
      retrying: 'Searching for alternative videos...'
    },
    errors: {
      apiKeyMissing: 'API key is not configured',
      invalidImage: 'Invalid image format',
      unexpected: 'An unexpected error occurred',
      videoError: 'Unable to load video content',
      languageError: 'Unable to get response in correct language'
    },
    howItWorks: {
      title: 'How It Works',
      upload: {
        title: 'Upload Plant Photo',
        description: 'Take a clear photo of any plant you want to identify',
        tooltip: 'Click to upload'
      },
      identify: {
        title: 'Instant Analysis',
        description: 'Our AI instantly identifies your plant species'
      },
      details: {
        title: 'Get Information',
        description: 'Receive detailed plant characteristics'
      },
      care: {
        title: 'Care Guide',
        description: 'Learn how to care for your plant'
      }
    }
  },
  hi: {
    home: {
      title: 'पौधा पहचानकर्ता',
      subtitle: 'किसी पौधे की पहचान करने के लिए एक छवि अपलोड करें या फोटो लें'
    },
    loading: {
      identifying: 'आपका पौधा पहचाना जा रहा है',
      analyzing: 'हमारी AI आपके पौधे की विशेषताओं का विश्लेषण कर रही है',
      videoLoading: 'देखभाल गाइड वीडियो खोज रहे हैं...'
    },
    video: {
      title: '{plantName} की पूर्ण देखभाल गाइड',
      description: 'अपने {plantName} को उगाने और देखभाल करने के बारे में सब कुछ जानें',
      channel: 'चैनल',
      languageFallback: 'वीडियो {preferredLanguage} में उपलब्ध नहीं है। {availableLanguage} संस्करण दिखाया जा रहा है।',
      noVideo: 'इस पौधे के लिए कोई देखभाल गाइड वीडियो उपलब्ध नहीं है',
      retrying: 'वैकल्पिक वीडियो खोज रहे हैं...'
    },
    errors: {
      apiKeyMissing: 'API कुंजी कॉन्फ़िगर नहीं की गई है',
      invalidImage: 'अमान्य छवि प्रारूप',
      unexpected: 'एक अनपेक्षित त्रुटि हुई',
      videoError: 'वीडियो सामग्री लोड करने में असमर्थ',
      languageError: 'सही भाषा में प्रतिक्रिया प्राप्त करने में असमर्थ'
    },
    howItWorks: {
      title: 'यह कैसे काम करता है',
      upload: {
        title: 'पौधे की फोटो अपलोड करें',
        description: 'किसी भी पौधे की स्पष्ट फोटो लें जिसे आप पहचानना चाहते हैं',
        tooltip: 'अपलोड करने के लिए क्लिक करें'
      },
      identify: {
        title: 'तत्काल विश्लेषण',
        description: 'हमारी AI तुरंत आपकी पौधे की प्रजाति की पहचान करती है'
      },
      details: {
        title: 'जानकारी प्राप्त करें',
        description: 'विस्तृत पौधे की विशेषताएं प्राप्त करें'
      },
      care: {
        title: 'देखभाल गाइड',
        description: 'अपने पौधे की देखभाल कैसे करें यह जानें'
      }
    }
  },
  gu: {
    home: {
      title: 'છોડ ઓળખકર્તા',
      subtitle: 'છોડની ઓળખ કરવા માટે છબી અપલોડ કરો અથવા ફોટો લો'
    },
    loading: {
      identifying: 'તમારો છોડ ઓળખાઈ રહ્યો છે',
      analyzing: 'અમારી AI તમારા છોડની લાક્ષણિકતાઓનું વિશ્લેષણ કરી રહી છે',
      videoLoading: 'સંભાળ માર્ગદર્શિકા વિડિઓ શોધી રહ્યા છીએ...'
    },
    video: {
      title: '{plantName} ની સંપૂર્ણ સંભાળ માર્ગદર્શિકા',
      description: 'તમારા {plantName} ને ઉગાડવા અને સંભાળ રાખવા વિશે બધું જાણો',
      channel: 'ચેનલ',
      languageFallback: 'વિડિઓ {preferredLanguage} માં ઉપલબ્ધ નથી. {availableLanguage} આવૃત્તિ બતાવી રહ્યા છીએ.',
      noVideo: 'આ છોડ માટે કોઈ સંભાળ માર્ગદર્શિકા વિડિઓ ઉપલબ્ધ નથી',
      retrying: 'વૈકલ્પિક વિડિઓ શોધી રહ્યા છીએ...'
    },
    errors: {
      apiKeyMissing: 'API કી કોન્ફિગર થયેલ નથી',
      invalidImage: 'અમાન્ય છબી ફોર્મેટ',
      unexpected: 'એક અનપેક્ષિત ભૂલ આવી',
      videoError: 'વિડિઓ સામગ્રી લોડ કરવામાં અસમર્થ',
      languageError: 'યોગ્ય ભાષામાં પ્રતિસાદ મેળવવામાં અસમર્થ'
    },
    howItWorks: {
      title: 'આ કેવી રીતે કામ કરે છે',
      upload: {
        title: 'છોડનો ફોટો અપલોડ કરો',
        description: 'કોઈપણ છોડનો સ્પષ્ટ ફોટો લો જે તમે ઓળખવા માંગો છો',
        tooltip: 'અપલોડ કરવા માટે ક્લિક કરો'
      },
      identify: {
        title: 'તાત્કાલિક વિશ્લેષણ',
        description: 'અમારી AI તરત જ તમારા છોડની જાતિને ઓળખે છે'
      },
      details: {
        title: 'માહિતી મેળવો',
        description: 'વિગતવાર છોડની લાક્ષણિકતાઓ મેળવો'
      },
      care: {
        title: 'સંભાળ માર્ગદર્શિકા',
        description: 'તમારા છોડની સંભાળ કેવી રીતે લેવી તે જાણો'
      }
    }
  }
}

type TranslationType = typeof translations.en

const LanguageContext = createContext<{
  locale: string
  setLocale: (locale: string) => void
  translations: TranslationType
}>({
  locale: 'en',
  setLocale: () => {},
  translations: translations.en
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState('en')

  useEffect(() => {
    const savedLocale = localStorage.getItem('preferredLanguage')
    if (savedLocale && savedLocale in translations) {
      setLocale(savedLocale)
    }
  }, [])

  const handleSetLocale = (newLocale: string) => {
    if (newLocale in translations) {
      setLocale(newLocale)
      localStorage.setItem('preferredLanguage', newLocale)
      
      document.documentElement.lang = newLocale
      
      const event = new CustomEvent('languageChange', { detail: { locale: newLocale } });
      document.dispatchEvent(event);
      
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('appLanguage', newLocale);
      }
    }
  }

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale: handleSetLocale,
        translations: translations[locale as keyof typeof translations]
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)