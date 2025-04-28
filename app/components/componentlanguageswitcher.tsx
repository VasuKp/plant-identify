'use client'

import { useState } from 'react'
import { useComponentLanguage } from '../context/componentlanguagecontext'

const languageNames = {
  en: 'English',
  hi: 'हिंदी',
  gu: 'ગુજરાતી'
}

export default function ComponentLanguageSwitcher() {
  const { componentLocale, setComponentLocale } = useComponentLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = (newLocale: string) => {
    setComponentLocale(newLocale)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1 
          bg-white text-[#22c55e] rounded-lg 
          hover:bg-gray-50 transition-colors
          shadow-sm border border-[#22c55e]/20 text-sm"
        title="Change language for this form only"
      >
        <span className="font-medium">
          {languageNames[componentLocale as keyof typeof languageNames]}
        </span>
        <svg
          className={`w-3 h-3 transform transition-transform duration-200 ${
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
        <div className="absolute left-0 mt-1 py-1 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
          {Object.entries(languageNames).map(([code, name]) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code)}
              className={`w-full px-3 py-1 text-left hover:bg-gray-50 transition-colors duration-200 text-sm ${
                componentLocale === code 
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