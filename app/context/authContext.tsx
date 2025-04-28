'use client'

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface UserData {
  id: string
  name: string
  email: string
  phoneNumber?: string
  role?: string
  lastLogin?: string
}

interface AuthContextType {
  user: UserData | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (token: string, userData: UserData) => void
  logout: () => void
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  
  const router = useRouter()
  const pathname = usePathname()
  
  // Session management functions
  const login = (token: string, userData: UserData) => {
    localStorage.setItem('authToken', token)
    localStorage.setItem('currentUser', JSON.stringify(userData))
    setUser(userData)
    setIsAuthenticated(true)
    setError(null)
  }
  
  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentUser')
    setUser(null)
    setIsAuthenticated(false)
    router.push('/')
  }
  
  // Function to refresh user data from the API
  const refreshUserData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        setIsAuthenticated(false)
        setUser(null)
        setLoading(false)
        return
      }
      
      const email = JSON.parse(localStorage.getItem('currentUser') || '{}')?.email
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Email': email || ''
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('authToken')
          localStorage.removeItem('currentUser')
          setIsAuthenticated(false)
          setUser(null)
          setError('Session expired. Please sign in again.')
          if (!pathname?.startsWith('/auth')) {
            router.push('/auth/login')
          }
          return
        }
        
        throw new Error('Failed to refresh user data')
      }
      
      const data = await response.json()
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to refresh user data')
      }
      
      setUser(data.data)
      setIsAuthenticated(true)
      
      // Update localStorage with the latest user data
      localStorage.setItem('currentUser', JSON.stringify(data.data))
      
    } catch (err) {
      console.error('Error refreshing user data:', err)
      setError('Failed to refresh user data')
    } finally {
      setLoading(false)
    }
  }
  
  // Check auth on initial load and when coming back to the app
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('authToken')
        
        if (token) {
          // Try to refresh user data from server
          await refreshUserData()
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch (err) {
        console.error('Authentication error:', err)
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    initAuth()
    
    // Listen for storage events (user logs in/out in another tab)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'authToken') {
        if (event.newValue) {
          refreshUserData()
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    refreshUserData
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 