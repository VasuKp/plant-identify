import { useState } from 'react'
import { useLanguage } from '../context/languagecontext'

interface PlantInfoProps {
  plantData: {
    commonName?: string;
    scientificName?: string;
    description?: string;
    careInstructions?: string;
    idealConditions?: string;
    imageUrl?: string;
  } | null;
  isLoading?: boolean;
}

export default function PlantInfo({ plantData, isLoading }: PlantInfoProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const { locale } = useLanguage()

  const translations = {
    en: {
      overview: 'Overview',
      details: 'Details',
      description: 'Description',
      careGuide: 'Care Guide',
      careInstructions: 'Care Instructions',
      idealConditions: 'Ideal Conditions',
      attribute: 'Attribute',
      commonName: 'Common Name',
      scientificName: 'Scientific Name',
      noDescription: 'No description available',
      noCareInstructions: 'No care instructions available',
      noConditions: 'No conditions specified',
      value: 'Value'
    },
    hi: {
      overview: 'अवलोकन',
      details: 'विवरण',
      description: 'विवरण',
      careGuide: 'देखभाल मार्गदर्शिका',
      careInstructions: 'देखभाल निर्देश',
      idealConditions: 'आदर्श स्थिति',
      attribute: 'विशेषता',
      commonName: 'सामान्य नाम',
      scientificName: 'वैज्ञानिक नाम',
      noDescription: 'कोई विवरण उपलब्ध नहीं है',
      noCareInstructions: 'कोई देखभाल निर्देश उपलब्ध नहीं है',
      noConditions: 'कोई स्थिति निर्दिष्ट नहीं की गई है',
      value: 'मान'
    },
    gu: {
      overview: 'ઝાંખી',
      details: 'વિગતો',
      description: 'વર્ણન',
      careGuide: 'સંભાળ માર્ગદર્શિકા',
      careInstructions: 'સંભાળ સૂચનાઓ',
      idealConditions: 'આદર્શ પરિસ્થિતિ',
      attribute: 'લક્ષણ',
      commonName: 'સામાન્ય નામ',
      scientificName: 'વૈજ્ઞાનિક નામ',
      noDescription: 'કોઈ વર્ણન ઉપલબ્ધ નથી',
      noCareInstructions: 'કોઈ સંભાળ સૂચનાઓ ઉપલબ્ધ નથી',
      noConditions: 'કોઈ પરિસ્થિતિ દર્શાવેલ નથી',
      value: 'મૂલ્ય'
    }
  }

  const t = translations[locale as keyof typeof translations] || translations.en

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc] animate-pulse">
        <div className="h-8 bg-[#e6d5bc] rounded w-3/4 mb-8"></div>
        <div className="mb-8 bg-[#fffbf4] p-6 rounded-lg border border-[#e6d5bc]">
          <div className="h-6 bg-[#e6d5bc] rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-[#e6d5bc] rounded w-full"></div>
            <div className="h-4 bg-[#e6d5bc] rounded w-5/6"></div>
            <div className="h-4 bg-[#e6d5bc] rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!plantData) return null

  return (
    <div className="max-w-4xl mx-auto p-8 bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc]">
      <h2 className="text-3xl font-bold mb-8 text-[#22c55e]">
        {plantData.commonName || t.noDescription}
      </h2>

      <div className="mb-8 border-b border-[#e6d5bc]">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-2 ${
              activeTab === 'overview'
                ? 'border-b-2 border-[#22c55e] text-[#22c55e]'
                : 'text-gray-600 hover:text-[#22c55e]'
            }`}
          >
            {t.overview}
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-4 px-2 ${
              activeTab === 'details'
                ? 'border-b-2 border-[#22c55e] text-[#22c55e]'
                : 'text-gray-600 hover:text-[#22c55e]'
            }`}
          >
            {t.details}
          </button>
        </nav>
      </div>

      {activeTab === 'overview' ? (
        <>
          <div className="mb-8 bg-[#fffbf4] p-6 rounded-lg border border-[#e6d5bc]">
            <h3 className="text-xl font-semibold text-[#22c55e] mb-3">
              {t.description}
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {plantData.description || t.noDescription}
            </p>
          </div>

          <div className="bg-[#fffbf4] p-6 rounded-lg border border-[#e6d5bc]">
            <h3 className="text-xl font-semibold text-[#22c55e] mb-4">
              {t.careGuide}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {t.careInstructions}
                </h4>
                <p className="text-gray-600 whitespace-pre-line">
                  {plantData.careInstructions || t.noCareInstructions}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {t.idealConditions}
                </h4>
                <p className="text-gray-600 whitespace-pre-line">
                  {plantData.idealConditions || t.noConditions}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#e6d5bc]">
          <table className="w-full border-collapse bg-[#fffbf4]">
            <thead>
              <tr className="bg-[#fff9ed]">
                <th className="w-1/4 text-left p-4 font-semibold text-[#22c55e] border-b border-[#e6d5bc]">
                  {t.attribute}
                </th>
                <th className="w-3/4 text-left p-4 font-semibold text-[#22c55e] border-b border-[#e6d5bc]">
                  {t.value}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-[#fff9ed] transition-colors">
                <td className="p-4 border-b border-[#e6d5bc] font-medium text-gray-700">
                  {t.commonName}
                </td>
                <td className="p-4 border-b border-[#e6d5bc] text-gray-600">
                  {plantData.commonName || t.noDescription}
                </td>
              </tr>
              <tr className="hover:bg-[#fff9ed] transition-colors">
                <td className="p-4 border-b border-[#e6d5bc] font-medium text-gray-700">
                  {t.scientificName}
                </td>
                <td className="p-4 border-b border-[#e6d5bc] text-gray-600 italic">
                  {plantData.scientificName || t.noDescription}
                </td>
              </tr>
              <tr className="hover:bg-[#fff9ed] transition-colors">
                <td className="p-4 border-b border-[#e6d5bc] font-medium text-gray-700">
                  {t.careInstructions}
                </td>
                <td className="p-4 border-b border-[#e6d5bc] text-gray-600 whitespace-pre-line">
                  {plantData.careInstructions || t.noCareInstructions}
                </td>
              </tr>
              <tr className="hover:bg-[#fff9ed] transition-colors">
                <td className="p-4 border-b border-[#e6d5bc] font-medium text-gray-700">
                  {t.idealConditions}
                </td>
                <td className="p-4 border-b border-[#e6d5bc] text-gray-600 whitespace-pre-line">
                  {plantData.idealConditions || t.noConditions}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}