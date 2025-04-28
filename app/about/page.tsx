'use client'

import { useLanguage } from '../context/languagecontext'
import Navbar from '../components/Navigation'
import Footer from '../components/Footer'
import Image from 'next/image'

export default function About() {
  const { translations } = useLanguage();

  const features = [
    {
      title: "AI-Powered Identification",
      description: "Advanced machine learning algorithms for accurate plant identification",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      title: "Comprehensive Plant Care",
      description: "Detailed care instructions and growing tips for every plant",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      title: "Multilingual Support",
      description: "Available in multiple languages for global accessibility",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      )
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#faf3e7]">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#22c55e] mb-6">
              About PlantID
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Empowering plant lovers with AI-driven identification and expert care guidance
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc] p-8 mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-[#22c55e] mb-4">Our Mission</h2>
                <p className="text-gray-700 mb-6">
                  At PlantID, we're passionate about connecting people with nature. Our mission is to make plant identification and care accessible to everyone, using cutting-edge AI technology to help you understand and nurture your plants.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-[#22c55e]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Instant plant identification</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-[#22c55e]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Expert care guidance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-[#22c55e]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Community support</span>
                  </div>
                </div>
              </div>
              <div className="relative h-64 md:h-96 rounded-xl overflow-hidden">
                <Image
                  src="/images/plants/plant-care-illustration.jpeg"
                  alt="Plant care illustration"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc] p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-[#22c55e] w-12 h-12 rounded-full flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#22c55e] mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-700">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Team Section */}
          <div className="bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc] p-8">
            <h2 className="text-3xl font-bold text-[#22c55e] mb-8 text-center">Our Team</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Add team member cards here */}
              <div className="text-center">
                <div className="w-32 h-32 bg-[#22c55e] rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-[#22c55e]">Plant Expert</h3>
                <p className="text-gray-700">Botanical Specialist</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 bg-[#22c55e] rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-[#22c55e]">AI Developer</h3>
                <p className="text-gray-700">Technical Lead</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 bg-[#22c55e] rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-[#22c55e]">Care Specialist</h3>
                <p className="text-gray-700">Plant Care Expert</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 