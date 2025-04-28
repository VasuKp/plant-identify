'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  FaEye, 
  FaEyeSlash, 
  FaArrowLeft, 
  FaShieldAlt, 
  FaLock, 
  FaGoogle, 
  FaApple, 
  FaFacebook, 
  FaRegQuestionCircle,
  FaFingerprint
} from 'react-icons/fa'
import { findUserByEmail } from '@/app/lib/db'
import bcrypt from 'bcryptjs'

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export default function EnhancedLoginPage() {
  const router = useRouter()
  
  // Form states
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [rememberMe, setRememberMe] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  
  // 2FA states
  const [showTwoFactorStep, setShowTwoFactorStep] = useState<boolean>(false)
  const [twoFactorCode, setTwoFactorCode] = useState<string>('')
  const [twoFactorMethod, setTwoFactorMethod] = useState<'app' | 'sms' | 'email'>('app')
  
  // Biometric authentication
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false)
  const [useBiometric, setUseBiometric] = useState<boolean>(false)
  
  // UI states
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [showHints, setShowHints] = useState<boolean>(false)
  
  // Security states
  const [loginAttempts, setLoginAttempts] = useState<number>(0)
  const [lockedUntil, setLockedUntil] = useState<number | undefined>(undefined)
  const [locationCheck, setLocationCheck] = useState<boolean>(false)
  const [deviceCheck, setDeviceCheck] = useState<boolean>(false)
  
  // Browser/device fingerprinting for security
  const [deviceId, setDeviceId] = useState<string>('')
  const [trustedDevice, setTrustedDevice] = useState<boolean>(false)
  
  // Helper function to check if account is locked
  const isAccountLocked = (): boolean => {
    return Boolean(lockedUntil && lockedUntil > Date.now());
  }

  // Check for lockout status and load security settings on mount
  useEffect(() => {
    // Check for device biometric capability
    if (window.PublicKeyCredential) {
      setBiometricAvailable(true);
    }
    
    // Check if this is a trusted device
    const storedDeviceId = localStorage.getItem('trustedDeviceId');
    if (storedDeviceId) {
      setTrustedDevice(true);
      setDeviceId(storedDeviceId);
    } else {
      // Generate a device ID (simplified for demo)
      const newDeviceId = "device-" + Math.random().toString(36).substring(2, 15);
      setDeviceId(newDeviceId);
    }
    
    // Load lockout status
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
  
  // Simulate biometric authentication
  const authenticateWithBiometric = async () => {
    setLoading(true);
    
    try {
      // Skip any processing - just proceed immediately to success
      
      // Mock success
      setSuccess('Biometric authentication successful');
      
      // Store device as trusted
      localStorage.setItem('trustedDeviceId', deviceId);
      setTrustedDevice(true);
      
      // Create session directly in client to avoid API call
      const token = "biometric-token-" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify({
        id: 'bio-auth-user',
        name: 'Biometric User',
        email: 'user@example.com',
        role: 'USER',
        lastLogin: new Date().toISOString()
      }));
      
      // Redirect immediately
      router.push('/dashboard');
    } catch (error) {
      setError('Biometric authentication failed. Please use password.');
    } finally {
      setLoading(false);
    }
  };
  
  // Record failed login attempts
  const recordFailedAttempt = () => {
    const attempts = loginAttempts + 1
    setLoginAttempts(attempts)
    localStorage.setItem('loginAttempts', attempts.toString())
    
    // Progressive lockout with shorter times for testing
    let lockoutSeconds = 15;
    if (attempts >= 10) {
      lockoutSeconds = 30; // 30 seconds
    } else if (attempts >= 7) {
      lockoutSeconds = 20; // 20 seconds
    }
    
    if (attempts >= 5) {
      const lockTime = Date.now() + lockoutSeconds * 1000
      setLockedUntil(lockTime)
      localStorage.setItem('lockedUntil', lockTime.toString())
    }
  }
  
  // Add reset lockout function
  const resetLockout = () => {
    localStorage.removeItem('loginAttempts')
    localStorage.removeItem('lockedUntil')
    setLoginAttempts(0)
    setLockedUntil(undefined)
    setError('') // Clear error message
  }
  
  // Handle form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (isAccountLocked()) {
      const timeRemaining = Math.ceil(((lockedUntil as number) - Date.now()) / 60000)
      setError(`Too many failed attempts. Please try again in ${timeRemaining} minutes.`)
      return
    }
    
    // Email validation
    if (!email || !EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    
    // Password validation
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    
    setLoading(true)
    
    try {
      // Find user in database
      const user = await findUserByEmail(email)
      
      if (!user) {
        setError('Invalid email or password')
        recordFailedAttempt()
        return
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)
      
      if (!isValidPassword) {
        setError('Invalid email or password')
        recordFailedAttempt()
        return
      }
      
      // Check if additional verification is needed
      if (!trustedDevice) {
        setShowTwoFactorStep(true)
        setLoading(false)
        return
      }
      
      // Update last login
      await findUserByEmail(user.id)
      
      // Create session
      const token = "user-token-" + Math.random().toString(36).substring(2, 15)
      localStorage.setItem('authToken', token)
      localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }))
      
      // Save device if "remember me" is checked
      if (rememberMe) {
        localStorage.setItem('trustedDeviceId', deviceId)
      }
      
      setSuccess('Login successful!')
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      setError('An error occurred during login')
      console.error('Login error:', error)
      recordFailedAttempt()
    } finally {
      setLoading(false)
    }
  }
  
  // Verify two-factor code
  const verifyTwoFactorCode = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (twoFactorCode.length !== 6 || !/^\d+$/.test(twoFactorCode)) {
      setError('Please enter a valid 6-digit code')
      return
    }
    
    setLoading(true)
    
    // For demo, we accept any 6-digit code
    setLoading(false)
    setShowTwoFactorStep(false)
    
    // Create session
    const token = "user-token-" + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('authToken', token)
    
    // Save device if "remember me" is checked
    if (rememberMe) {
      localStorage.setItem('trustedDeviceId', deviceId)
    }
    
    setSuccess('Login successful!')
    
    // Redirect to dashboard
    router.push('/dashboard')
  }

  // Component for password hints
  const PasswordHints = () => (
    <div className="mt-2 text-sm text-gray-600">
      <ul className="space-y-1 list-disc pl-5">
        <li>Use at least 8 characters</li>
        <li>Include uppercase and lowercase letters</li>
        <li>Include at least one number</li>
        <li>Include at least one special character</li>
      </ul>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card header with logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image 
              src="/logo.svg" 
              alt="Plant Identifier" 
              width={60} 
              height={60} 
              className="mx-auto"
            />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to access your account</p>
        </div>
        
        {/* Main card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Alerts */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}
          
          {isAccountLocked() && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaLock className="h-5 w-5 text-amber-500" />
                </div>
                <div className="ml-3 flex-grow">
                  <p className="text-sm text-amber-700">
                    Account temporarily locked. Try again in {Math.ceil((lockedUntil as number - Date.now()) / 1000)} seconds.
                  </p>
                  <button
                    onClick={resetLockout}
                    className="mt-2 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-2 py-1 rounded float-right"
                  >
                    Reset Lockout (Testing Only)
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Form content */}
          <div className="p-6">
            {/* Biometric option */}
            {biometricAvailable && !showTwoFactorStep && !isAccountLocked() && (
              <div className="mb-6 text-center">
                <button
                  onClick={authenticateWithBiometric}
                  disabled={loading}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mx-auto mb-2 hover:bg-green-200 transition-colors"
                >
                  <FaFingerprint className="w-6 h-6" />
                </button>
                <p className="text-sm text-gray-600">Sign in with biometrics</p>
              </div>
            )}
            
            {showTwoFactorStep ? (
              <form onSubmit={verifyTwoFactorCode} className="space-y-6">
                <div>
                  <div className="mb-6 bg-blue-50 rounded-lg p-4">
                    <div className="flex">
                      <FaShieldAlt className="h-6 w-6 text-blue-500 mr-3" />
                      <div>
                        <h3 className="font-medium text-blue-800">Two-Factor Authentication</h3>
                        <p className="text-blue-700 text-sm mt-1">
                          For additional security, please enter the verification code sent to your {twoFactorMethod === 'app' ? 'authentication app' : twoFactorMethod === 'sms' ? 'phone via SMS' : 'email'}.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Method
                    </label>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setTwoFactorMethod('app')}
                        className={`px-3 py-2 text-sm rounded-md flex items-center ${
                          twoFactorMethod === 'app' 
                            ? 'bg-green-100 text-green-700 border border-green-300' 
                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}
                      >
                        <FaShieldAlt className="mr-2" /> 
                        App
                      </button>
                      <button
                        type="button"
                        onClick={() => setTwoFactorMethod('sms')}
                        className={`px-3 py-2 text-sm rounded-md flex items-center ${
                          twoFactorMethod === 'sms' 
                            ? 'bg-green-100 text-green-700 border border-green-300' 
                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        SMS
                      </button>
                      <button
                        type="button"
                        onClick={() => setTwoFactorMethod('email')}
                        className={`px-3 py-2 text-sm rounded-md flex items-center ${
                          twoFactorMethod === 'email' 
                            ? 'bg-green-100 text-green-700 border border-green-300' 
                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email
                      </button>
                    </div>
                  </div>
                  
                  <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="twoFactorCode"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center text-xl tracking-widest"
                    placeholder="●●●●●●"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowTwoFactorStep(false)}
                    disabled={loading}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    &larr; Back to login
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading || twoFactorCode.length !== 6}
                    className={`px-4 py-2 rounded-lg text-white font-medium ${
                      loading || twoFactorCode.length !== 6
                        ? 'bg-green-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : 'Verify'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    disabled={loading || isAccountLocked()}
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setShowHints(!showHints)}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                    >
                      <FaRegQuestionCircle className="mr-1 h-3 w-3" />
                      Password tips
                    </button>
                  </div>
                  
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      disabled={loading || isAccountLocked()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={loading || isAccountLocked()}
                    >
                      {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {showHints && <PasswordHints />}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      disabled={loading || isAccountLocked()}
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Trust this device for 30 days
                    </label>
                  </div>
                  
                  <div className="text-sm">
                    <Link href="/auth/forgot-password" className="font-medium text-green-600 hover:text-green-500">
                      Forgot password?
                    </Link>
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={loading || isAccountLocked()}
                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white ${
                      loading || isAccountLocked()
                        ? 'bg-green-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : 'Sign in'}
                  </button>
                </div>
                
                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    className="inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <FaGoogle className="h-5 w-5 text-red-500" />
                  </button>
                  
                  <button
                    type="button"
                    className="inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <FaApple className="h-5 w-5 text-gray-900" />
                  </button>
                  
                  <button
                    type="button"
                    className="inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <FaFacebook className="h-5 w-5 text-blue-600" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* Card footer */}
        <div className="mt-6 text-center">
          <p className="text-base text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/enhanced-signup" className="font-medium text-green-600 hover:text-green-500">
              Create an account
            </Link>
          </p>
        </div>
        
        {/* For demo purposes */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Demo credentials</p>
          <p className="font-mono bg-gray-100 rounded p-2 mt-2 inline-block">
            Email: admin@example.com<br />
            Password: Admin123!
          </p>
        </div>
      </div>
    </div>
  )
} 