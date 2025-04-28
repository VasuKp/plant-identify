'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../context/languagecontext'

const Navbar = () => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { translations, locale } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [cartItemCount, setCartItemCount] = useState(0)

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('authToken')
      setIsLoggedIn(!!token)
      
      // If token exists, try to decode it to get role
      if (token) {
        try {
          // JWT is in format header.payload.signature
          const payload = token.split('.')[1]
          const decodedPayload = JSON.parse(atob(payload))
          setUserRole(decodedPayload.role)
        } catch (error) {
          console.error('Error decoding token:', error)
          setUserRole(null)
        }
      } else {
        setUserRole(null)
      }
    }
    
    checkAuthStatus()
    window.addEventListener('storage', checkAuthStatus)
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus)
    }
  }, [])

  // Fetch cart data
  useEffect(() => {
    const fetchCartData = async () => {
      if (!isLoggedIn) {
        setCartItemCount(0)
        return
      }

      try {
        const token = localStorage.getItem('authToken')
        if (!token) return

        const response = await fetch('/api/cart', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data.cart.items) {
            // Calculate total items in cart
            const totalItems = data.data.cart.items.reduce(
              (sum: number, item: any) => sum + item.quantity, 0
            )
            setCartItemCount(totalItems)
          }
        }
      } catch (error) {
        console.error('Error fetching cart:', error)
      }
    }

    fetchCartData()

    // Set up an interval to refresh cart data every minute
    const intervalId = setInterval(fetchCartData, 60000)
    
    return () => clearInterval(intervalId)
  }, [isLoggedIn])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Handle logout
  const handleLogout = async () => {
    try {
      // Call logout API to clear cookies
      await fetch('/api/auth/logout', {
        method: 'GET'
      });
      
      // Clear localStorage
      localStorage.removeItem('authToken');
      
      // Update state
      setIsLoggedIn(false);
      setUserRole(null);
      setShowUserMenu(false);
      
      // Navigate home
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear localStorage even if API fails
      localStorage.removeItem('authToken');
      setIsLoggedIn(false);
      setUserRole(null);
      router.push('/');
    }
  }

  // Navigation items with translations
  const navItems = {
    en: {
      home: 'Home',
      identify: 'Identify',
      shop: 'Shop Plants',
      guide: 'Plant Guide',
      about: 'About',
      contact: 'Contact',
      feedback: 'Feedback',
      login: 'Login',
      signup: 'Sign Up',
      profile: 'Profile',
      admin: 'Admin',
      logout: 'Logout',
      cart: 'Cart',
      wishlist: 'Wishlist'
    },
    hi: {
      home: 'होम',
      identify: 'पहचानें',
      shop: 'पौधे खरीदें',
      guide: 'पौधों की गाइड',
      about: 'हमारे बारे में',
      contact: 'संपर्क करें',
      feedback: 'प्रतिक्रिया',
      login: 'लॉग इन',
      signup: 'साइन अप',
      profile: 'प्रोफाइल',
      admin: 'एडमिन',
      logout: 'लॉग आउट',
      cart: 'कार्ट',
      wishlist: 'इच्छा-सूची'
    },
    gu: {
      home: 'હોમ',
      identify: 'ઓળખો',
      shop: 'છોડ ખરીદો',
      guide: 'છોડ માર્ગદર્શિકા',
      about: 'અમારા વિશે',
      contact: 'સંપર્ક કરો',
      feedback: 'પ્રતિસાદ',
      login: 'લોગિન',
      signup: 'સાઇન અપ',
      profile: 'પ્રોફાઇલ',
      admin: 'એડમિન',
      logout: 'લોગઆઉટ',
      cart: 'કાર્ટ',
      wishlist: 'ઇચ્છાસૂચિ'
    }
  }

  const currentNav = navItems[locale as keyof typeof navItems] || navItems.en

  return (
    <>
      <nav className={`py-3 px-4 transition-all duration-300 ${scrolled ? 'bg-[#22c55e] shadow-md' : 'bg-[#22c55e]'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#22c55e]"></div>
            </div>
            <span className="text-xl font-bold text-white">PlantIDentifier</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-white hover:bg-white hover:text-[#22c55e] px-3 py-2 rounded transition-colors">
              {currentNav.home}
            </Link>
            <Link href="/identify" className="text-white hover:bg-white hover:text-[#22c55e] px-3 py-2 rounded transition-colors" prefetch={true}>
              {currentNav.identify}
            </Link>
            <Link href="/shop" className="text-white hover:bg-white hover:text-[#22c55e] px-3 py-2 rounded transition-colors">
              {currentNav.shop}
            </Link>
            <Link href="/guide" className="text-white hover:bg-white hover:text-[#22c55e] px-3 py-2 rounded transition-colors">
              {currentNav.guide}
            </Link>
            <Link href="/about" className="text-white hover:bg-white hover:text-[#22c55e] px-3 py-2 rounded transition-colors">
              {currentNav.about}
            </Link>
            <Link href="/contact" className="text-white hover:bg-white hover:text-[#22c55e] px-3 py-2 rounded transition-colors">
              {currentNav.contact}
            </Link>
          </div>

          {/* Right Side - Authentication & Cart */}
          <div className="flex items-center space-x-4">
            {/* Wishlist Icon */}
            <Link href="/wishlist" className="relative text-gray-700 hover:text-[#22c55e] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>
            
            {/* Cart Icon */}
            {isLoggedIn && (
              <Link href="/cart" className="relative text-gray-700 hover:text-[#22c55e] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#22c55e] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {isLoggedIn ? (
              <div className="relative">
                <button 
                  className="hidden md:flex items-center group focus:outline-none"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="w-8 h-8 rounded-full bg-white text-[#22c55e] flex items-center justify-center transition-all duration-300 border-2 border-transparent group-hover:border-[#22c55e] group-hover:shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <svg className="w-4 h-4 ml-1 transition-all duration-300 text-white group-hover:text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* User dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-gray-700 hover:bg-[#e8f5e9] hover:text-[#22c55e]"
                      onClick={() => setShowUserMenu(false)}
                    >
                      {currentNav.profile}
                    </Link>
                    
                    {userRole === 'ADMIN' && (
                      <Link 
                        href="/admin" 
                        className="block px-4 py-2 text-gray-700 hover:bg-[#e8f5e9] hover:text-[#22c55e]"
                        onClick={() => setShowUserMenu(false)}
                      >
                        {currentNav.admin}
                      </Link>
                    )}
                    
                    <Link 
                      href="/cart" 
                      className="block px-4 py-2 text-gray-700 hover:bg-[#e8f5e9] hover:text-[#22c55e]"
                      onClick={() => setShowUserMenu(false)}
                    >
                      {currentNav.cart} {cartItemCount > 0 && `(${cartItemCount})`}
                    </Link>
                    
                    <button 
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-[#e8f5e9] hover:text-[#22c55e]"
                      onClick={handleLogout}
                    >
                      {currentNav.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/auth" 
                className="hidden md:block bg-[#22c55e] text-white px-4 py-2 rounded-lg hover:bg-[#1ea550] transition-colors"
              >
                {currentNav.login}
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-700 focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                {isOpen ? (
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 bg-white shadow-lg rounded-lg py-4 px-2 absolute top-16 left-0 right-0 z-50">
            <div className="flex flex-col space-y-4">
              <Link href="/" 
                className="px-4 py-2 text-gray-700 hover:bg-[#e8f5e9] rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {currentNav.home}
              </Link>
              <Link href="/identify" 
                className="px-4 py-2 text-gray-700 hover:bg-[#e8f5e9] rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
                prefetch={true}
              >
                {currentNav.identify}
              </Link>
              <Link href="/shop" 
                className="px-4 py-2 text-gray-700 hover:bg-[#e8f5e9] rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {currentNav.shop}
              </Link>
              <Link href="/guide" 
                className="px-4 py-2 text-gray-700 hover:bg-[#e8f5e9] rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {currentNav.guide}
              </Link>
              <Link href="/about" 
                className="px-4 py-2 text-gray-700 hover:bg-[#e8f5e9] rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {currentNav.about}
              </Link>
              <Link href="/contact" 
                className="px-4 py-2 text-gray-700 hover:bg-[#e8f5e9] rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {currentNav.contact}
              </Link>
              
              {isLoggedIn ? (
                <>
                  <Link href="/profile" 
                    className="px-4 py-2 text-gray-700 hover:bg-[#e8f5e9] rounded-md transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {currentNav.profile}
                  </Link>
                  
                  {userRole === 'ADMIN' && (
                    <Link href="/admin" 
                      className="px-4 py-2 text-gray-700 hover:bg-[#e8f5e9] rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {currentNav.admin}
                    </Link>
                  )}
                  
                  <Link 
                    href="/cart" 
                    className="px-4 py-2 text-gray-700 hover:bg-[#e8f5e9] rounded-md transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {currentNav.cart} {cartItemCount > 0 && `(${cartItemCount})`}
                  </Link>
                  
                  <button 
                    className="mx-4 bg-[#22c55e] text-white px-4 py-2 rounded-lg hover:bg-[#1ea550] transition-colors"
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                  >
                    {currentNav.logout}
                  </button>
                </>
              ) : (
                <Link 
                  href="/auth" 
                  className="mx-4 bg-[#22c55e] text-white px-4 py-2 rounded-lg hover:bg-[#1ea550] transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {currentNav.login}
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

export default Navbar