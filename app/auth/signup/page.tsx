'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FaEye, FaEyeSlash, FaArrowLeft, FaCheck, FaTimes, FaUserPlus, FaLock } from 'react-icons/fa'
import { useAuth } from '@/app/context/authContext'

// Password strength criteria
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_HAS_UPPERCASE = /[A-Z]/
const PASSWORD_HAS_LOWERCASE = /[a-z]/
const PASSWORD_HAS_NUMBER = /[0-9]/
const PASSWORD_HAS_SPECIAL = /[^A-Za-z0-9]/
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export default function SignupPage() {
  const router = useRouter()
  const { login } = useAuth()
  
  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  
  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [recaptchaVerified, setRecaptchaVerified] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState<Date | undefined>(undefined)
  
  // Password strength checks
  const passwordChecks = {
    length: password.length >= PASSWORD_MIN_LENGTH,
    uppercase: PASSWORD_HAS_UPPERCASE.test(password),
    lowercase: PASSWORD_HAS_LOWERCASE.test(password),
    number: PASSWORD_HAS_NUMBER.test(password),
    special: PASSWORD_HAS_SPECIAL.test(password)
  }
  
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length
  
  // Helper function to check if account is locked
  const isAccountLocked = (): boolean => {
    return Boolean(lockoutUntil && lockoutUntil > new Date());
  }

  // Check lockout on load
  useEffect(() => {
    const storedLockout = localStorage.getItem('signupLockout')
    if (storedLockout) {
      const lockoutTime = new Date(storedLockout)
      if (lockoutTime > new Date()) {
        setLockoutUntil(lockoutTime)
      } else {
        localStorage.removeItem('signupLockout')
      }
    }
    
    // Get attempt count
    const attempts = localStorage.getItem('signupAttempts')
    if (attempts) {
      setLoginAttempts(parseInt(attempts))
    }
  }, [])
  
  // Simulated recaptcha verification - in a real app you'd use actual reCAPTCHA
  const verifyRecaptcha = () => {
    setRecaptchaVerified(true)
    return true
  }

  // Form validation
  const isFormValid = () => {
    // Check if locked out
    if (isAccountLocked()) {
      const timeRemaining = Math.ceil((lockoutUntil!.getTime() - new Date().getTime()) / 60000)
      setError(`Too many failed attempts. Please try again in ${timeRemaining} minutes.`)
      return false
    }
    
    if (!name || !email || !password || !confirmPassword) {
      setError('All required fields must be filled')
      return false
    }
    
    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address')
      return false
    }
    
    // Password must meet all requirements
    if (passwordStrength < 4) {
      setError('Password does not meet security requirements')
      return false
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    
    // In production, this would be a real verification
    if (!recaptchaVerified && !verifyRecaptcha()) {
      setError('Please verify you are not a robot')
      return false
    }
    
    return true
  }
  
  // Record failed attempt and potentially lock account
  const recordFailedAttempt = () => {
    const newAttempts = loginAttempts + 1
    setLoginAttempts(newAttempts)
    localStorage.setItem('signupAttempts', newAttempts.toString())
    
    // Lock after 5 attempts
    if (newAttempts >= 5) {
      const lockTime = new Date()
      lockTime.setMinutes(lockTime.getMinutes() + 30) // Lock for 30 minutes
      setLockoutUntil(lockTime)
      localStorage.setItem('signupLockout', lockTime.toString())
      setError(`Too many failed attempts. Account creation locked for 30 minutes.`)
    }
  }
  
  // Signup handler - Using PostgreSQL database
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!isFormValid()) {
      recordFailedAttempt()
      return
    }
    
    setLoading(true)
    
    try {
      // Call the API to create user
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phoneNumber
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account')
      }
      
      // Reset attempts on success
      localStorage.removeItem('signupAttempts')
      localStorage.removeItem('signupLockout')
      
      setSuccess('Account created successfully! Redirecting to login...')
      
      // Redirect to login page with email prefilled
      setTimeout(() => {
        router.push(`/auth/login?email=${encodeURIComponent(email)}`)
      }, 2000)
    } catch (error: any) {
      setError(error.message || 'An error occurred during signup')
      console.error('Signup error:', error)
      recordFailedAttempt()
    } finally {
      setLoading(false)
    }
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
          <h2 className="text-2xl font-semibold mb-6">Start Your Plant Journey Today</h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of plant enthusiasts and discover the perfect plants for your space. 
            Identify unknown plants, track your collection, and connect with a community of plant lovers.
          </p>
          <div className="bg-white/20 p-6 rounded-lg backdrop-blur-sm">
            <p className="font-medium text-white mb-2">Why join Plant Identifier?</p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <FaCheck className="mr-3 text-emerald-200" />
                <span>Identify any plant with our AI technology</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="mr-3 text-emerald-200" />
                <span>Get personalized plant care reminders</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="mr-3 text-emerald-200" />
                <span>Access to exclusive plant guides and resources</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <div className="flex justify-between items-center mb-8">
            <Link href="/auth" className="text-gray-600 hover:text-teal-600 flex items-center">
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
              <FaUserPlus className="text-2xl text-teal-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Create an Account</h1>
            <p className="text-gray-500 mt-1">Join our community of plant enthusiasts</p>
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
          
          {lockoutUntil && lockoutUntil > new Date() && (
            <div className="bg-amber-50 text-amber-600 p-4 rounded-lg mb-6 flex items-start">
              <FaLock className="mr-3 mt-1 flex-shrink-0" />
              <span>Account creation temporarily locked. Try again later.</span>
            </div>
          )}
          
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition"
                placeholder="John Doe"
                required
                disabled={loading || isAccountLocked()}
              />
            </div>
            
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
              {email && !EMAIL_REGEX.test(email) && (
                <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
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
              
              {/* Password strength indicator */}
              {(passwordFocused || password) && (
                <div className="mt-3 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="mb-2">
                    <div className="flex h-2 overflow-hidden bg-gray-200 rounded">
                      <div className="h-2 rounded-l" style={{ 
                        width: `${passwordStrength * 20}%`,
                        backgroundColor: 
                          passwordStrength === 0 ? '#e5e7eb' : 
                          passwordStrength === 1 ? '#ef4444' : 
                          passwordStrength === 2 ? '#f97316' : 
                          passwordStrength === 3 ? '#eab308' : 
                          passwordStrength === 4 ? '#84cc16' : '#22c55e'
                      }}></div>
                    </div>
                    <p className="text-xs mt-1 text-gray-500">
                      Password strength: {
                        passwordStrength === 0 ? 'None' : 
                        passwordStrength === 1 ? 'Very weak' : 
                        passwordStrength === 2 ? 'Weak' : 
                        passwordStrength === 3 ? 'Medium' : 
                        passwordStrength === 4 ? 'Strong' : 'Very strong'
                      }
                    </p>
                  </div>
                  <p className="font-medium text-gray-700 mb-2">Password must contain:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      {passwordChecks.length ? 
                        <FaCheck className="text-teal-500 mr-2 text-sm" /> : 
                        <FaTimes className="text-red-500 mr-2 text-sm" />
                      }
                      <span className={passwordChecks.length ? "text-teal-700" : "text-gray-600"}>
                        At least {PASSWORD_MIN_LENGTH} characters
                      </span>
                    </li>
                    <li className="flex items-center">
                      {passwordChecks.uppercase ? 
                        <FaCheck className="text-teal-500 mr-2 text-sm" /> : 
                        <FaTimes className="text-red-500 mr-2 text-sm" />
                      }
                      <span className={passwordChecks.uppercase ? "text-teal-700" : "text-gray-600"}>
                        At least one uppercase letter
                      </span>
                    </li>
                    <li className="flex items-center">
                      {passwordChecks.lowercase ? 
                        <FaCheck className="text-teal-500 mr-2 text-sm" /> : 
                        <FaTimes className="text-red-500 mr-2 text-sm" />
                      }
                      <span className={passwordChecks.lowercase ? "text-teal-700" : "text-gray-600"}>
                        At least one lowercase letter
                      </span>
                    </li>
                    <li className="flex items-center">
                      {passwordChecks.number ? 
                        <FaCheck className="text-teal-500 mr-2 text-sm" /> : 
                        <FaTimes className="text-red-500 mr-2 text-sm" />
                      }
                      <span className={passwordChecks.number ? "text-teal-700" : "text-gray-600"}>
                        At least one number
                      </span>
                    </li>
                    <li className="flex items-center">
                      {passwordChecks.special ? 
                        <FaCheck className="text-teal-500 mr-2 text-sm" /> : 
                        <FaTimes className="text-red-500 mr-2 text-sm" />
                      }
                      <span className={passwordChecks.special ? "text-teal-700" : "text-gray-600"}>
                        At least one special character
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition"
                  placeholder="••••••••"
                  required
                  disabled={loading || isAccountLocked()}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading || isAccountLocked()}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {password !== confirmPassword && confirmPassword.length > 0 && (
                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (optional)
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition"
                placeholder="+1 (123) 456-7890"
                disabled={loading || isAccountLocked()}
              />
            </div>
            
            {/* Simulated reCAPTCHA */}
            <div className="flex items-center space-x-2 py-2">
              <input
                type="checkbox"
                id="recaptcha"
                checked={recaptchaVerified}
                onChange={() => setRecaptchaVerified(!recaptchaVerified)}
                className="h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                disabled={loading || isAccountLocked()}
              />
              <label htmlFor="recaptcha" className="text-sm text-gray-700">
                I'm not a robot (simulated reCAPTCHA)
              </label>
            </div>
            
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
                  Creating Account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-teal-600 hover:text-teal-800 hover:underline font-medium transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 