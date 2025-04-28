'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FaUser, FaEnvelope, FaKey, FaArrowLeft, FaSave, FaShieldAlt } from 'react-icons/fa'

interface UserData {
  id: string
  name: string
  email: string
  phoneNumber?: string
  role?: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
  })
  
  useEffect(() => {
    const checkAuth = () => {
      // Get token from localStorage
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        // Redirect to login if no token found
        router.push('/auth/login')
        return
      }
      
      try {
        // Get user data from localStorage
        const userDataStr = localStorage.getItem('currentUser')
        if (!userDataStr) {
          // If no user data but token exists, clear token and redirect
          localStorage.removeItem('authToken')
          router.push('/auth/login')
          return
        }
        
        // Parse user data
        const userData = JSON.parse(userDataStr)
        setUserData(userData)
        
        // Initialize form data
        setFormData({
          name: userData.name || '',
          phoneNumber: userData.phoneNumber || '',
        })
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('currentUser')
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [router])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    try {
      // Get existing data
      const userDataStr = localStorage.getItem('currentUser')
      if (!userDataStr) {
        setError('User data not found')
        return
      }
      
      const currentUserData = JSON.parse(userDataStr)
      
      // Update user data with form values
      const updatedUserData = {
        ...currentUserData,
        name: formData.name,
        phoneNumber: formData.phoneNumber
      }
      
      // Update localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUserData))
      
      // Update state
      setUserData(updatedUserData)
      setSuccess('Settings updated successfully')
      
      // Show success message for 2 seconds then redirect
      setTimeout(() => {
        router.push('/profile')
      }, 2000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update settings')
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500 border-opacity-50 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }
  
  if (!userData) {
    return null // This should not happen as we redirect in useEffect, but just in case
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image src="/logo.svg" alt="Plant Identifier" width={40} height={40} />
            <span className="ml-2 text-xl font-bold text-green-600">Plant Identifier</span>
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <FaUser className="mr-2" />
            My Profile
          </Link>
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg leading-6 font-medium text-gray-900">Account Settings</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Update your personal information</p>
              </div>
              <Link
                href="/profile"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <FaArrowLeft className="mr-2" />
                Back to Profile
              </Link>
            </div>
          </div>
          
          {error && (
            <div className="border-t border-red-200 px-4 py-3 bg-red-50 text-red-600">
              {error}
            </div>
          )}
          
          {success && (
            <div className="border-t border-green-200 px-4 py-3 bg-green-50 text-green-600">
              {success}
            </div>
          )}
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 focus:outline-none"
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={userData.email}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    placeholder="your@email.com"
                    disabled
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (optional)
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 focus:outline-none"
                  placeholder="+1 (123) 456-7890"
                />
              </div>
              
              <div className="pt-5 border-t border-gray-200">
                <div className="flex justify-end">
                  <Link
                    href="/profile"
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <FaSave className="mr-2 -ml-1 h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-red-50">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Security Settings</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your password and account security</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-medium text-gray-900">Change Password</h3>
                  <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
                </div>
                <Link
                  href="#"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <FaKey className="mr-2 -ml-1 h-4 w-4" />
                  Update Password
                </Link>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <h3 className="text-md font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <Link
                  href="/settings/security"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <FaShieldAlt className="mr-2 -ml-1 h-4 w-4" />
                  Manage 2FA
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 