'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useComponentLanguage } from '../context/componentlanguagecontext'
import ComponentLanguageSwitcher from './componentlanguageswitcher'

interface AuthModalContentProps {
    onClose: () => void
}

export default function AuthModalContent({ onClose }: AuthModalContentProps) {
    const { componentLocale, t } = useComponentLanguage()
    const router = useRouter()
    
    // Form states
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
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
    
    // Password validation check
    useEffect(() => {
        if (password) {
            let strength = 0
            const errors = []
            
            // Length check
            if (password.length >= 8) strength += 1
            else errors.push('Password must be at least 8 characters long')
            
            // Uppercase check
            if (/[A-Z]/.test(password)) strength += 1
            else errors.push('Include at least one uppercase letter')
            
            // Lowercase check
            if (/[a-z]/.test(password)) strength += 1
            else errors.push('Include at least one lowercase letter')
            
            // Number check
            if (/[0-9]/.test(password)) strength += 1
            else errors.push('Include at least one number')
            
            // Special character check
            if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 1
            else errors.push('Include at least one special character')
            
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
            
            // Store token in localStorage
            localStorage.setItem('authToken', data.data.token)
            
            setSuccess('Login successful!')
            setTimeout(() => {
        onClose()
                router.refresh()
            }, 1000)
            
        } catch (error) {
            setError('An error occurred during login')
            console.error('Login error:', error)
        } finally {
            setLoading(false)
        }
    }
    
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
                    phoneNumber: phoneNumber || undefined
                })
            })
            
            const data = await response.json()
            
            if (!data.success) {
                console.error('Signup failed:', data)
                setError(data.message || 'Signup failed')
                return
            }
            
            setSuccess('Account created successfully! You can now login.')
            setTimeout(() => {
                setActiveTab('login')
                setName('')
                setEmail('')
                setPassword('')
                setConfirmPassword('')
                setPhoneNumber('')
                setSuccess(null)
            }, 2000)
            
        } catch (error) {
            console.error('Signup error:', error)
            setError('An error occurred during signup. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                aria-label="Close"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Language switcher */}
            <div className="absolute top-4 left-4">
                <ComponentLanguageSwitcher />
            </div>

            {/* Tabs */}
            <div className="flex border-b mt-12">
                <button
                    className={`flex-1 py-4 text-center font-medium ${
                        activeTab === 'login'
                        ? 'text-[#22c55e] border-b-2 border-[#22c55e]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => {
                        setActiveTab('login')
                        setError(null)
                        setSuccess(null)
                    }}
                >
                    {t.login}
                </button>
                <button
                    className={`flex-1 py-4 text-center font-medium ${
                        activeTab === 'signup'
                        ? 'text-[#22c55e] border-b-2 border-[#22c55e]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => {
                        setActiveTab('signup')
                        setError(null)
                        setSuccess(null)
                    }}
                >
                    {t.signup}
                </button>
            </div>
            
            <div className="p-6">
                {/* Error and success messages */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg">
                        {success}
                    </div>
                )}
                
                {activeTab === 'login' ? (
                    <form onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                                {t.email}
                            </label>
                            <input
                                type="email"
                                    id="login-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] focus:outline-none text-gray-900 bg-white"
                                placeholder="your@email.com"
                                    required
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                                    {t.password}
                                </label>
                                <a href="#" className="text-sm text-[#22c55e] hover:underline">
                                    {t.forgotPassword}
                                </a>
                            </div>
                                <div className="relative">
                            <input
                                        type={showPassword ? "text" : "password"}
                                        id="login-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] focus:outline-none text-gray-900 bg-white"
                                placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                                    >
                                        {showPassword ? (
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                          </svg>
                                        ) : (
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                          </svg>
                                        )}
                                    </button>
                                </div>
                        </div>

                        <button
                            type="submit"
                                disabled={!isLoginFormValid || loading}
                                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                                    isLoginFormValid && !loading 
                                        ? 'bg-[#22c55e] text-white hover:bg-[#1ea550]' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {loading ? 'Loading...' : t.loginButton}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSignup}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="signup-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] focus:outline-none text-gray-900 bg-white"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t.email}
                                </label>
                                <input
                                    type="email"
                                    id="signup-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] focus:outline-none text-gray-900 bg-white"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="signup-phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number (Optional)
                                </label>
                                <input
                                    type="tel"
                                    id="signup-phone"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] focus:outline-none text-gray-900 bg-white"
                                    placeholder="+1 (123) 456-7890"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">
                                        {t.password}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={generatePasswordSuggestions}
                                        className="text-xs text-[#22c55e] hover:text-[#1ea550] font-medium"
                                    >
                                        Suggest strong password
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="signup-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] focus:outline-none text-gray-900 bg-white"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                                    >
                                        {showPassword ? (
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                          </svg>
                                        ) : (
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                          </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Password suggestions dropdown */}
                            {showPasswordSuggestions && (
                                <div className="mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10 relative">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Suggested strong passwords:</p>
                                    <div className="space-y-2">
                                        {passwordSuggestions.map((suggestion, index) => (
                                            <div key={index} className="flex justify-between items-center border border-gray-200 rounded p-2">
                                                <div className="text-sm font-mono px-2 py-1 rounded bg-gray-100 text-gray-800">
                                                    {suggestion}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => usePasswordSuggestion(suggestion)}
                                                    className="text-xs bg-[#22c55e] text-white px-2 py-1 rounded hover:bg-[#1ea550]"
                                                >
                                                    Use this
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordSuggestions(false)}
                                        className="w-full mt-3 text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        Close suggestions
                                    </button>
                                </div>
                            )}
                            
                            {/* Password strength indicator */}
                            {password && (
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">Password Strength</span>
                                        <span className="text-sm">
                                            {passwordStrength === 0 && 'Very Weak'}
                                            {passwordStrength === 1 && 'Weak'}
                                            {passwordStrength === 2 && 'Fair'}
                                            {passwordStrength === 3 && 'Good'}
                                            {passwordStrength === 4 && 'Strong'}
                                            {passwordStrength === 5 && 'Very Strong'}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-2 ${
                                                passwordStrength < 2 ? 'bg-red-500' :
                                                passwordStrength < 4 ? 'bg-yellow-500' :
                                                'bg-green-500'
                                            }`}
                                            style={{ width: `${passwordStrength * 20}%` }}
                                        />
                                    </div>
                                    
                                    {/* Password requirements */}
                                    {passwordErrors.length > 0 && (
                                        <ul className="mt-2 text-sm text-red-600 space-y-1">
                                            {passwordErrors.map((error, index) => (
                                                <li key={index} className="flex items-center">
                                                    <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                    {error}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            <div>
                                <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="signup-confirm-password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] focus:outline-none text-gray-900 bg-white"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                                    >
                                        {showConfirmPassword ? (
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                          </svg>
                                        ) : (
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                          </svg>
                                        )}
                                    </button>
                                </div>
                                {password && confirmPassword && password !== confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={!isSignupFormValid || loading}
                                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                                    isSignupFormValid && !loading 
                                        ? 'bg-[#22c55e] text-white hover:bg-[#1ea550]' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {loading ? 'Loading...' : t.signupButton}
                        </button>
                    </div>
                </form>
                )}
            </div>
        </div>
    )
} 