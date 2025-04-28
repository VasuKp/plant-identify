'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
  role: string
  phoneNumber?: string
  lastLogin?: string
  createdAt: string
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch all users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const token = localStorage.getItem('authToken')
        
        if (!token) {
          router.push('/')
          return
        }
        
        const response = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.status === 401 || response.status === 403) {
          setError('You are not authorized to access this page')
          setTimeout(() => {
            router.push('/')
          }, 3000)
          return
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }
        
        const data = await response.json()
        
        if (data.success) {
          setUsers(data.data)
        } else {
          throw new Error(data.message || 'Failed to load users')
        }
      } catch (err) {
        console.error('Error fetching users:', err)
        setError('An error occurred while loading users')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUsers()
  }, [router])
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    router.push('/')
    router.refresh()
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#22c55e] border-b-[#22c55e] border-l-transparent border-r-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-xl">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-4 text-xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <Link href="/" className="mt-6 inline-block px-6 py-3 bg-[#22c55e] text-white rounded-lg font-medium hover:bg-[#1ea550] transition-colors">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#22c55e] py-6 px-6 sm:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-green-100 mt-1">Manage users and view statistics</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white text-[#22c55e] rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 sm:p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map(user => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-500">{user.phoneNumber || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-500">
                              {user.lastLogin 
                                ? new Date(user.lastLogin).toLocaleString()
                                : 'Never'
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.role === 'ADMIN'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Statistics section could go here */}
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="text-green-500 text-2xl font-bold">{users.length}</div>
                  <div className="text-gray-700">Total Users</div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="text-blue-500 text-2xl font-bold">
                    {users.filter(user => 
                      user.lastLogin && 
                      new Date(user.lastLogin).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                    ).length}
                  </div>
                  <div className="text-gray-700">Active in Last 7 Days</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="text-purple-500 text-2xl font-bold">
                    {users.filter(user => 
                      new Date(user.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
                    ).length}
                  </div>
                  <div className="text-gray-700">New This Month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-[#22c55e] hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
} 