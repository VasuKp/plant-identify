'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FaUser, FaEnvelope, FaPhone, FaSignOutAlt, FaHistory, FaCog, FaIdCard, FaCalendarAlt, FaCamera, FaExclamationCircle, FaLock, FaShieldAlt, FaLeaf } from 'react-icons/fa'
import { useAuth } from '../context/authContext'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, error, logout, refreshUserData } = useAuth()
  const [refreshing, setRefreshing] = useState(false)
  
  // Function to manually refresh user data
  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshUserData()
    setRefreshing(false)
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-500 border-opacity-50 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">
            <FaExclamationCircle className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              Try Again
            </button>
            <Link 
              href="/" 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  if (!user) {
    router.push('/auth/login')
    return null
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <header className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <span className="relative flex items-center">
              <FaLeaf className="text-green-200 animate-bounce mr-2 text-3xl drop-shadow-lg" />
              <Image src="/logo.svg" alt="Plant Identifier" width={40} height={40} />
            </span>
            <span className="ml-2 text-xl font-bold text-white drop-shadow">Plant Identifier</span>
          </Link>
          <button
            onClick={logout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition shadow-sm hover:shadow"
          >
            <FaSignOutAlt className="mr-2" />
            Sign Out
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-xl">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-teal-500 to-emerald-500 flex justify-between items-center">
            <div>
              <h3 className="text-xl leading-6 font-medium text-white">User Profile</h3>
              <p className="mt-1 max-w-2xl text-sm text-teal-50">Personal details and preferences</p>
            </div>
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {user.name ? (
                  <div className="text-3xl font-bold text-teal-600">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                ) : (
                  <FaUser className="text-4xl text-teal-300" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition">
                <FaCamera size={14} />
              </button>
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FaUser className="mr-2 text-teal-500" />
                  Full Name
                </dt>
                <dd className="mt-1 text-lg text-gray-900 font-medium">{user.name}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FaEnvelope className="mr-2 text-teal-500" />
                  Email Address
                </dt>
                <dd className="mt-1 text-lg text-gray-900">{user.email}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FaPhone className="mr-2 text-teal-500" />
                  Phone Number
                </dt>
                <dd className="mt-1 text-lg text-gray-900">
                  {user.phoneNumber || 'Not provided'}
                </dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FaIdCard className="mr-2 text-teal-500" />
                  Account Type
                </dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'ADMIN' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-teal-100 text-teal-800'
                  }`}>
                    {user.role === 'ADMIN' ? 'Administrator' : 'Regular User'}
                  </span>
                </dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FaCalendarAlt className="mr-2 text-teal-500" />
                  Last Login
                </dt>
                <dd className="mt-1 text-lg text-gray-900">
                  {user.lastLogin 
                    ? new Date(user.lastLogin).toLocaleString() 
                    : 'Not available'}
                </dd>
              </div>
            </dl>
          </div>
          
          {/* Security Info */}
          <div className="py-4 border-t border-gray-200">
            <h3 className="text-md font-medium text-gray-900 mb-2">Security</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">Enhance your account security with two-factor authentication</p>
              </div>
              <Link
                href="/settings/security"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <FaShieldAlt className="mr-2 -ml-1 h-4 w-4" />
                Manage 2FA
              </Link>
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6 bg-gray-50">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50 transition shadow-sm"
              >
                Back to Home
              </Link>
              <Link
                href="/settings/account"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition shadow-sm"
              >
                <FaCog className="mr-2" />
                Account Settings
              </Link>
              <Link
                href="/settings/password"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200 transition shadow-sm"
              >
                <FaLock className="mr-2" />
                Change Password
              </Link>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50 transition shadow-sm"
              >
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Activity Section */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-xl">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-emerald-500 to-teal-500">
            <h3 className="text-xl leading-6 font-medium text-white">Recent Activity</h3>
            <p className="mt-1 max-w-2xl text-sm text-teal-50">Your recent interactions and history</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <p className="text-gray-500 italic text-center py-8">No recent activity to display</p>
            <div className="text-center mt-4">
              <Link
                href="/identify"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition shadow-sm"
              >
                <FaCamera className="mr-2" />
                Identify a Plant
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 