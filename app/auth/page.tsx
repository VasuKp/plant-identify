'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function AuthPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  
  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [bio, setBio] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<number>(0)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showPasswordSuggestions, setShowPasswordSuggestions] = useState(false)
  const [passwordSuggestions, setPasswordSuggestions] = useState<string[]>([])
  const [showSavePasswordDialog, setShowSavePasswordDialog] = useState(false)
  const signupSuccessRef = useRef<HTMLDivElement>(null)
  
  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      router.push('/profile')
    }
  }, [router])
  
  // Password validation
  useEffect(() => {
    if (password) {
      let strength = 0
      const errors = []
      
      // Length check
      if (password.length >= 8) strength += 1
      else errors.push('At least 8 characters')
      
      // Uppercase check
      if (/[A-Z]/.test(password)) strength += 1
      else errors.push('One uppercase letter')
      
      // Lowercase check
      if (/[a-z]/.test(password)) strength += 1
      else errors.push('One lowercase letter')
      
      // Number check
      if (/[0-9]/.test(password)) strength += 1
      else errors.push('One number')
      
      // Special character check
      if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 1
      else errors.push('One special character')
      
      setPasswordStrength(strength)
      setPasswordErrors(errors)
    } else {
      setPasswordStrength(0)
      setPasswordErrors([])
    }
  }, [password])
  
  // Form validation
  const isLoginFormValid = email.trim() !== '' && password.trim() !== ''
  const isSignupFormValid = 
    email.trim() !== '' && 
    password.trim() !== '' && 
    name.trim() !== '' && 
    password === confirmPassword &&
    passwordStrength >= 3
  
  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (!data.success) {
        setError(data.message || 'Login failed')
        return
      }
      
      // Store token in localStorage for client-side usage
      localStorage.setItem('authToken', data.data.token)
      
      // Also store token in cookies (will be done by the API)
      document.cookie = `authToken=${data.data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
      
      setSuccess('Login successful!')
      setTimeout(() => {
        if (data.data.user.role === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push('/profile')
        }
      }, 1000)
      
    } catch (error) {
      setError('An error occurred during login')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Generate password suggestions
  const generatePasswordSuggestions = () => {
    const suggestions: string[] = []
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-='
    
    for (let i = 0; i < 3; i++) {
      let pwd = ''
      // Add at least one uppercase
      pwd += chars.substring(0, 26).charAt(Math.floor(Math.random() * 26))
      // Add at least one lowercase
      pwd += chars.substring(26, 52).charAt(Math.floor(Math.random() * 26))
      // Add at least one number
      pwd += chars.substring(52, 62).charAt(Math.floor(Math.random() * 10))
      // Add at least one special character
      pwd += chars.substring(62).charAt(Math.floor(Math.random() * (chars.length - 62)))
      
      // Add more random characters to reach at least 12 characters
      for (let j = 0; j < 8; j++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      
      // Shuffle the password characters
      pwd = pwd.split('').sort(() => 0.5 - Math.random()).join('')
      suggestions.push(pwd)
    }
    
    setPasswordSuggestions(suggestions)
    setShowPasswordSuggestions(true)
  }
  
  // Use a suggestion as password
  const usePasswordSuggestion = (suggestion: string) => {
    setPassword(suggestion)
    setConfirmPassword(suggestion)
    setShowPasswordSuggestions(false)
  }

  // Function to offer saving password
  const handleSavePassword = () => {
    // Close the dialog
    setShowSavePasswordDialog(false)
    
    // Trying to trigger browser's password save functionality
    const passwordInput = document.getElementById('password') as HTMLInputElement
    if (passwordInput) {
      // Focus and modify to help browser recognize a successful login
      passwordInput.focus()
      
      // For some browsers this helps trigger the save password dialog
      setTimeout(() => {
        // Will attempt login after signup
        handleLogin({
          preventDefault: () => {}
        } as React.FormEvent)
      }, 500)
    }
  }
  
  // Scroll to success message when shown
  useEffect(() => {
    if (success && signupSuccessRef.current) {
      signupSuccessRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [success])
  
  // Signup handler
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          phoneNumber: phoneNumber || undefined,
          address: address || undefined,
          bio: bio || undefined
        })
      })
      
      const data = await response.json()
      
      if (!data.success) {
        setError(data.message || 'Signup failed')
        return
      }
      
      setSuccess('Account created successfully!')
      
      // Show password save option
      setShowSavePasswordDialog(true)
      
      // If token is included in response, store it and redirect
      if (data.data?.token) {
        localStorage.setItem('authToken', data.data.token)
        
        // Also store in cookie
        document.cookie = `authToken=${data.data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
        
        // Delayed redirect to allow time to save password
        setTimeout(() => {
          router.push('/profile')
        }, 3000)
      } else {
        // If no token, just switch to login
        setTimeout(() => {
          setActiveTab('login')
          setEmail('')
          setPassword('')
        }, 1500)
      }
      
    } catch (error) {
      setError('An error occurred during signup')
      console.error('Signup error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f0faf0] to-[#e6f7ef] p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Image 
              src="/logo.svg" 
              alt="Plant Identifier" 
              width={80} 
              height={80} 
              className="rounded-lg bg-white p-2 shadow-md"
            />
          </div>
          <h1 className="text-3xl font-bold text-green-700 mb-2">Plant Identifier</h1>
          <p className="text-gray-600">Sign in or create an account to access all features</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="space-y-4">
              <Link 
                href="/auth/login" 
                className="block w-full text-center py-3 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition duration-200"
              >
                Sign In
              </Link>
              
              <Link 
                href="/auth/signup" 
                className="block w-full text-center py-3 px-4 rounded-lg border border-green-600 text-green-600 hover:bg-green-50 font-medium transition duration-200"
              >
                Create an Account
              </Link>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or continue as guest</span>
                </div>
              </div>
              
              <Link
                href="/"
                className="block w-full text-center py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition duration-200"
              >
                Back to Home
              </Link>
            </div>
          </div>
          
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <p className="text-sm text-gray-600 text-center">
              By signing in or creating an account, you agree to our
              <Link href="/terms" className="text-green-600 hover:underline ml-1">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-green-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 