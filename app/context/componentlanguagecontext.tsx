'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// Define our own translations specifically for auth components
export const componentTranslations = {
  en: {
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Full Name',
    forgotPassword: 'Forgot Password?',
    loginButton: 'Login',
    signupButton: 'Create Account'
  },
  hi: {
    login: 'लॉग इन',
    signup: 'साइन अप',
    email: 'ईमेल',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    name: 'पूरा नाम',
    forgotPassword: 'पासवर्ड भूल गए?',
    loginButton: 'लॉग इन करें',
    signupButton: 'खाता बनाएं'
  },
  gu: {
    login: 'લોગિન',
    signup: 'સાઇન અપ',
    email: 'ઈમેલ',
    password: 'પાસવર્ડ',
    confirmPassword: 'પાસવર્ડની પુષ્ટિ કરો',
    name: 'પૂરું નામ',
    forgotPassword: 'પાસવર્ડ ભૂલી ગયા છો?',
    loginButton: 'લોગિન કરો',
    signupButton: 'ખાતું બનાવો'
  }
}

type ComponentTranslationType = typeof componentTranslations.en;

const ComponentLanguageContext = createContext<{
  componentLocale: string
  setComponentLocale: (locale: string) => void
  t: ComponentTranslationType
}>({
  componentLocale: 'en',
  setComponentLocale: () => {},
  t: componentTranslations.en
})

export function ComponentLanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to 'en' but now we'll sync with main language context
  const [componentLocale, setComponentLocale] = useState('en')

  // Initialize from localStorage to match main language context
  useEffect(() => {
    const savedLocale = localStorage.getItem('preferredLanguage')
    if (savedLocale && savedLocale in componentTranslations) {
      setComponentLocale(savedLocale)
    }
  }, [])

  // Listen for language change events from the main context
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      if (event.detail && event.detail.locale && event.detail.locale in componentTranslations) {
        setComponentLocale(event.detail.locale)
      }
    }

    // Add event listener for the custom event
    document.addEventListener('languageChange', handleLanguageChange as EventListener)
    
    // Also check sessionStorage in case event was missed
    if (typeof window !== 'undefined') {
      const appLanguage = window.sessionStorage.getItem('appLanguage')
      if (appLanguage && appLanguage in componentTranslations) {
        setComponentLocale(appLanguage)
      }
    }

    return () => {
      document.removeEventListener('languageChange', handleLanguageChange as EventListener)
    }
  }, [])

  // Handle locale change only for this component tree
  const handleSetComponentLocale = (newLocale: string) => {
    if (newLocale in componentTranslations) {
      setComponentLocale(newLocale)
    }
  }

  return (
    <ComponentLanguageContext.Provider
      value={{
        componentLocale,
        setComponentLocale: handleSetComponentLocale,
        t: componentTranslations[componentLocale as keyof typeof componentTranslations]
      }}
    >
      {children}
    </ComponentLanguageContext.Provider>
  )
}

export const useComponentLanguage = () => useContext(ComponentLanguageContext) 