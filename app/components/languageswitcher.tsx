'use client'

import { useState } from 'react'
import { useLanguage } from '../context/languagecontext'

const languageNames = {
  en: 'English',
  hi: 'हिंदी',
  gu: 'ગુજરાતી'
}

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = (newLocale: string) => {
    setLocale(newLocale)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 
          bg-white text-[#22c55e] rounded-lg 
          hover:bg-gray-50 transition-colors
          shadow-sm"
      >
        <span className="font-medium">
          {languageNames[locale as keyof typeof languageNames]}
        </span>
        <svg
          className={`w-4 h-4 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
          {Object.entries(languageNames).map(([code, name]) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200 ${
                locale === code 
                  ? 'text-[#22c55e] font-medium' 
                  : 'text-gray-700'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}