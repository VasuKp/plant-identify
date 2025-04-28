'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FaEye, FaEyeSlash, FaArrowLeft, FaShieldAlt, FaLock, FaUserAlt, FaTimes, FaCheck } from 'react-icons/fa'
import { useAuth } from '@/app/context/authContext'

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  
  // Get the callback URL if any
  const callbackUrl = searchParams?.get('callbackUrl') || '/'
  
  // Form states
  const [email, setEmail] = useState<string>(searchParams?.get('email') || '')
  const [password, setPassword] = useState<string>('')
  const [rememberMe, setRememberMe] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  
  // 2FA states
  const [showTwoFactorStep, setShowTwoFactorStep] = useState<boolean>(false)
  const [twoFactorCode, setTwoFactorCode] = useState<string>('')
  
  // UI states
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  
  // Security states
  const [loginAttempts, setLoginAttempts] = useState<number>(0)
  const [lockedUntil, setLockedUntil] = useState<number | undefined>(undefined)
  
  // Helper function to check if account is locked
  const isAccountLocked = (): boolean => {
    return Boolean(lockedUntil && lockedUntil > Date.now());
  }

  // Check for lockout status on load
  useEffect(() => {
    const storedAttempts = localStorage.getItem('loginAttempts')
    const storedLockTime = localStorage.getItem('lockedUntil')
    
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts))
    }
    
    if (storedLockTime) {
      const lockTime = parseInt(storedLockTime)
      if (lockTime > Date.now()) {
        setLockedUntil(lockTime)
      } else {
        // Reset if lock time has passed
        localStorage.removeItem('lockedUntil')
        setLockedUntil(undefined)
      }
    }
  }, [])
  
  // Record failed login attempts
  const recordFailedAttempt = () => {
    const attempts = loginAttempts + 1
    setLoginAttempts(attempts)
    localStorage.setItem('loginAttempts', attempts.toString())
    
    // Lock account after 5 failed attempts (15 seconds for testing)
    if (attempts >= 5) {
      const lockTime = Date.now() + 15 * 1000 // 15 seconds instead of 15 minutes
      setLockedUntil(lockTime)
      localStorage.setItem('lockedUntil', lockTime.toString())
    }
  }
  
  // Simulate 2FA verification (would connect to a real service in production)
  const verifyTwoFactorCode = (code: string): boolean => {
    // For demo purposes, any 6-digit number is valid
    return /^\d{6}$/.test(code)
  }
  
  // Login handler using PostgreSQL database
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Check if locked out
    if (isAccountLocked()) {
      const timeRemaining = Math.ceil(((lockedUntil as number) - Date.now()) / 1000)
      setError(`Too many failed attempts. Please try again in ${timeRemaining} seconds.`)
      return
    }
    
    // Check if we're in 2FA step
    if (showTwoFactorStep) {
      if (!twoFactorCode) {
        setError('Please enter your verification code')
        return
      }
      
      if (verifyTwoFactorCode(twoFactorCode)) {
        completeLogin()
      } else {
        setError('Invalid verification code')
        recordFailedAttempt()
      }
      return
    }
    
    // First step validation
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    
    if (!EMAIL_REGEX.test(email) && email !== 'admin' && email !== 'vasu23') {
      setError('Please enter a valid email address')
      return
    }
    
    setLoading(true)
    
    try {
      // Special handling for vasukapadiya23@gmail.com - direct login
      if (email === 'vasukapadiya23@gmail.com' && password.length > 0) {
        // Create session directly
        const token = "admin-token-" + Math.random().toString(36).substring(2, 15)
        login(token, {
          id: 'admin-id',
          name: 'Vasu',
          email: email,
          role: 'ADMIN',
          lastLogin: new Date().toISOString()
        })
        
        localStorage.removeItem('loginAttempts')
        localStorage.removeItem('lockedUntil')
        
        setSuccess('Login successful!')
        setLoading(false)
        
        // Redirect immediately
        router.push('/admin')
        return
      }
      
      // Special handling for demo admin accounts - bypass API call for demo purposes
      if ((email === 'admin' && password === 'admin123') || 
          (email === 'vasu23' && password === 'Vasukp@2212') ||
          (email === 'admin@example.com' && password === 'Admin123!') ||
          (email === 'user@example.com' && password === 'User123!')) {
        
        // For demo, show 2FA for admins to simulate extra security
        if (email === 'admin' || email === 'vasu23' || email === 'admin@example.com') {
          setLoading(false)
          setShowTwoFactorStep(true)
          return
        }
        
        // For regular demo users, direct login
        const token = "demo-token-" + Math.random().toString(36).substring(2, 15)
        login(token, {
          id: 'demo-user-id',
          name: email === 'user@example.com' ? 'Demo User' : email,
          email: email,
          role: 'USER',
          lastLogin: new Date().toISOString()
        })
        
        // Reset attempts on success
        localStorage.removeItem('loginAttempts')
        localStorage.removeItem('lockedUntil')
        
        setSuccess('Login successful!')
        
        // Redirect based on callback URL or role
        if (callbackUrl && callbackUrl !== '/') {
          router.push(callbackUrl)
        } else {
          router.push('/')
        }
        return
      }
      
      // Call the login API for non-demo users
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password')
      }
      
      // If 2FA is enabled (future feature), show 2FA step
      if (data.requiresTwoFactor) {
        setLoading(false)
        setShowTwoFactorStep(true)
        return
      }
      
      // Use the auth context to login
      login(data.token, {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phoneNumber: data.user.phoneNumber,
        role: data.user.role,
        lastLogin: data.user.lastLogin
      })
      
      // Reset attempts on success
      localStorage.removeItem('loginAttempts')
      localStorage.removeItem('lockedUntil')
      
      setSuccess('Login successful!')
      
      // Redirect based on callback URL or role
      if (callbackUrl && callbackUrl !== '/') {
        router.push(callbackUrl)
      } else if (data.user.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/')
      }
      
    } catch (error: any) {
      setError(error.message || 'An error occurred during login')
      console.error('Login error:', error)
      recordFailedAttempt()
      setLoading(false)
    }
  }
  
  // Complete the login process after verification
  const completeLogin = async () => {
    setLoading(true)
    
    // For all demo accounts, bypass API calls completely
    if (email === 'admin' || email === 'vasu23' || email === 'admin@example.com' || 
        email === 'user@example.com' || email === 'vasukapadiya23@gmail.com') {
      // Create appropriate user data based on email
      const isAdmin = ['admin', 'vasu23', 'admin@example.com', 'vasukapadiya23@gmail.com'].includes(email);
      const token = (isAdmin ? "admin-token-" : "user-token-") + Math.random().toString(36).substring(2, 15);
      const userData = {
        id: isAdmin ? 'admin-id' : 'user-id',
        name: isAdmin ? (email === 'admin' ? 'Administrator' : 'Vasu') : 'Demo User',
        email: email,
        role: isAdmin ? 'ADMIN' : 'USER',
        lastLogin: new Date().toISOString()
      };
      
      // Login directly without API call
      login(token, userData);
      
      // Reset attempts on success
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('lockedUntil');
      
      setSuccess('Login successful!');
      setLoading(false);
      
      // Redirect based on role
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/');
      }
      return;
    }
    
    try {
      // In a real app, would verify the 2FA code with the backend
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: twoFactorCode
        }),
      }).catch(() => {
        // Fallback for demo - directly process admin accounts
        if (email === 'admin' || email === 'vasu23') {
          return {
            ok: true,
            json: async () => ({
              token: "admin-token-" + Math.random().toString(36).substring(2, 15),
              user: {
                id: 'admin-id',
                name: email === 'admin' ? 'Administrator' : 'Vasu',
                email: email,
                role: 'ADMIN',
                lastLogin: new Date().toISOString()
              }
            })
          } as Response
        }
        throw new Error('Failed to verify code')
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify code')
      }
      
      // Use the auth context to login
      login(data.token, {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phoneNumber: data.user.phoneNumber,
        role: data.user.role,
        lastLogin: data.user.lastLogin
      })
      
      // Reset attempts on success
      localStorage.removeItem('loginAttempts')
      localStorage.removeItem('lockedUntil')
      
      setSuccess('Login successful!')
      
      // Redirect based on callback URL or role
      if (callbackUrl && callbackUrl !== '/') {
        router.push(callbackUrl)
      } else if (data.user.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during verification')
      console.error('Verification error:', error)
      recordFailedAttempt()
    } finally {
      setLoading(false)
    }
  }

  // Function to create a demo user session locally
  const loginAsDemoUser = () => {
    // Create a demo token
    const demoToken = "demo-token-" + Math.random().toString(36).substring(2, 15);
    
    // Create demo user data
    const demoUser = {
      id: 'demo-user-id',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'USER',
      lastLogin: new Date().toISOString()
    };
    
    // Use the auth context login function
    login(demoToken, demoUser);
    
    // Set success state briefly before redirect
    setSuccess('Demo login successful!');
    
    // Immediate redirect to profile page
    router.push('/profile');
  };

  // Function to reset lockout for testing purposes
  const resetLockout = () => {
    localStorage.removeItem('loginAttempts')
    localStorage.removeItem('lockedUntil')
    setLoginAttempts(0)
    setLockedUntil(undefined)
    setError('') // Clear error message
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Left side - Branding/Image */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-emerald-500 to-teal-600 p-12 justify-center items-center">
        <div className="max-w-md text-white">
          <div className="mb-6 flex items-center">
            <Image src="/logo.svg" alt="Plant Identifier" width={48} height={48} className="mr-4" />
            <h1 className="text-3xl font-bold">Plant Identifier</h1>
          </div>
          
          <h2 className="text-2xl font-semibold mb-6">Welcome Back</h2>
          <p className="text-lg opacity-90 mb-8">
            Log in to your account to continue your plant journey. 
            Identify plants, track your collection, and connect with other plant enthusiasts.
          </p>
          
          <div className="bg-white/20 p-6 rounded-lg backdrop-blur-sm">
            <p className="font-medium text-white mb-2">Plant Identifier offers:</p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <FaCheck className="mr-3 text-emerald-200" />
                <span>Instant plant identification with AI</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="mr-3 text-emerald-200" />
                <span>Personalized plant care guides</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="mr-3 text-emerald-200" />
                <span>Community of plant enthusiasts</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <div className="flex justify-between items-center mb-8">
            <Link href="/auth" className="text-gray-600 hover:text-teal-600 flex items-center transition">
              <FaArrowLeft className="mr-2" />
              Back
            </Link>
            <div className="md:hidden flex items-center">
              <Image src="/logo.svg" alt="Plant Identifier" width={30} height={30} />
              <span className="ml-2 text-xl font-bold text-teal-600">Plant Identifier</span>
            </div>
          </div>
          
          <div className="mb-6 text-center">
            <div className="inline-flex justify-center items-center w-16 h-16 bg-teal-100 rounded-full mb-4">
              <FaUserAlt className="text-2xl text-teal-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              {showTwoFactorStep ? 'Two-Factor Authentication' : 'Sign In'}
            </h1>
            <p className="text-gray-500 mt-1">
              {showTwoFactorStep 
                ? 'Enter the verification code to continue' 
                : 'Access your plant identification journey'}
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-start">
              <FaTimes className="mr-3 mt-1 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-lg mb-6 flex items-start">
              <FaCheck className="mr-3 mt-1 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}
          
          {lockedUntil && lockedUntil > Date.now() && (
            <div className="bg-amber-50 text-amber-600 p-4 rounded-lg mb-6 flex items-start">
              <FaLock className="mr-3 mt-1 flex-shrink-0" />
              <div className="flex flex-col w-full">
                <span>
                  Account temporarily locked. Try again in {Math.ceil((lockedUntil - Date.now()) / 1000)} seconds.
                </span>
                <button
                  onClick={resetLockout}
                  className="mt-2 self-end text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-2 py-1 rounded"
                >
                  Reset Lockout (Testing Only)
                </button>
              </div>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-5">
            {/* 2FA Step */}
            {showTwoFactorStep ? (
              <div className="space-y-5">
                <div className="text-center mb-2">
                  <FaShieldAlt className="text-4xl mx-auto mb-2 text-teal-600" />
                  <p className="text-gray-600">
                    Please enter the 6-digit verification code sent to your device.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="2fa-code" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code *
                  </label>
                  <input
                    type="text"
                    id="2fa-code"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition text-center text-xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    autoComplete="one-time-code"
                    required
                    disabled={loading || isAccountLocked()}
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition"
                    placeholder="your@email.com"
                    required
                    disabled={loading || isAccountLocked()}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password *
                    </label>
                    <Link href="/auth/reset-password" className="text-sm text-teal-600 hover:text-teal-800 hover:underline transition">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition"
                      placeholder="••••••••"
                      required
                      disabled={loading || isAccountLocked()}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading || isAccountLocked()}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                    disabled={loading || isAccountLocked()}
                  />
                  <label htmlFor="remember-me" className="text-sm text-gray-700">
                    Remember me for 30 days
                  </label>
                </div>
              </>
            )}
            
            <button
              type="submit"
              disabled={loading || isAccountLocked()}
              className={`w-full py-3 rounded-lg text-white font-medium transition-all ${
                loading || isAccountLocked() 
                  ? 'bg-teal-400 cursor-not-allowed opacity-70' 
                  : 'bg-teal-600 hover:bg-teal-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {showTwoFactorStep ? 'Verifying...' : 'Signing In...'}
                </span>
              ) : (showTwoFactorStep ? 'Verify Code' : 'Sign In')}
            </button>
          </form>
          
          {/* Demo user login button */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={loginAsDemoUser}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Quick Login as Demo User
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {showTwoFactorStep ? (
                <>
                  <button 
                    onClick={() => setShowTwoFactorStep(false)}
                    className="text-teal-600 hover:text-teal-800 hover:underline font-medium transition"
                    disabled={loading}
                  >
                    Back to login
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <Link href="/auth/signup" className="text-teal-600 hover:text-teal-800 hover:underline font-medium transition">
                    Sign up
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 