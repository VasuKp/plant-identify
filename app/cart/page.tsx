'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../context/languagecontext'
import Navbar from '../components/Navigation'
import Footer from '../components/Footer'
import { FaTrash, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa'

// CartItem type definition
interface CartItem {
  id: string
  plantId: string
  quantity: number
  plant: {
    id: string
    name: {
      en: string
      hi: string
      gu: string
    }
    scientificName: string
    price: number
    image: string
    fallbackImage: string
  }
}

// Cart translations
const cartText = {
  en: {
    title: 'Your Cart',
    emptyCart: 'Your cart is empty',
    continueShopping: 'Continue Shopping',
    product: 'Product',
    price: 'Price',
    quantity: 'Quantity',
    total: 'Total',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    tax: 'Tax',
    orderTotal: 'Order Total',
    checkout: 'Proceed to Checkout',
    removeItem: 'Remove item',
    estimatedTotal: 'Estimated Total',
    loading: 'Loading your cart...',
    error: 'Error loading cart',
    tryAgain: 'Try Again',
    updateQuantity: 'Update Quantity',
    orderSummary: 'Order Summary',
    clearCart: 'Clear Cart'
  },
  hi: {
    title: 'आपकी कार्ट',
    emptyCart: 'आपकी कार्ट खाली है',
    continueShopping: 'खरीदारी जारी रखें',
    product: 'उत्पाद',
    price: 'मूल्य',
    quantity: 'मात्रा',
    total: 'कुल',
    subtotal: 'उप-कुल',
    shipping: 'शिपिंग',
    tax: 'कर',
    orderTotal: 'आदेश का कुल',
    checkout: 'चेकआउट करें',
    removeItem: 'आइटम हटाएं',
    estimatedTotal: 'अनुमानित कुल',
    loading: 'आपकी कार्ट लोड हो रही है...',
    error: 'कार्ट लोड करने में त्रुटि',
    tryAgain: 'पुनः प्रयास करें',
    updateQuantity: 'मात्रा अपडेट करें',
    orderSummary: 'आदेश का सारांश',
    clearCart: 'कार्ट खाली करें'
  },
  gu: {
    title: 'તમારી કાર્ટ',
    emptyCart: 'તમારી કાર્ટ ખાલી છે',
    continueShopping: 'શોપિંગ ચાલુ રાખો',
    product: 'ઉત્પાદન',
    price: 'કિંમત',
    quantity: 'જથ્થો',
    total: 'કુલ',
    subtotal: 'પેટા-કુલ',
    shipping: 'શિપિંગ',
    tax: 'કર',
    orderTotal: 'ઓર્ડર કુલ',
    checkout: 'ચેકઆઉટ કરો',
    removeItem: 'આઇટમ દૂર કરો',
    estimatedTotal: 'અંદાજિત કુલ',
    loading: 'તમારી કાર્ટ લોડ થઈ રહી છે...',
    error: 'કાર્ટ લોડ કરવામાં ભૂલ',
    tryAgain: 'ફરી પ્રયાસ કરો',
    updateQuantity: 'જથ્થો અપડેટ કરો',
    orderSummary: 'ઓર્ડર સારાંશ',
    clearCart: 'કાર્ટ ખાલી કરો'
  }
}

export default function Cart() {
  const { locale } = useLanguage()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({})

  // Get cart translations based on locale
  const t = cartText[locale as keyof typeof cartText] || cartText.en

  // Update rupee conversion rate (1 USD = approximately 75 INR)
  const rupeeConversionRate = 75;

  // Fetch cart data
  useEffect(() => {
    const fetchCart = async () => {
      setIsLoading(true)
      setError('')

      try {
        const token = localStorage.getItem('authToken')
        if (!token) {
          router.push('/auth')
          return
        }

        const response = await fetch('/api/cart', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch cart')
        }

        const data = await response.json()
        if (data.success && data.data.cart) {
          setCartItems(data.data.cart.items || [])
        } else {
          setCartItems([])
        }
      } catch (err) {
        console.error('Error fetching cart:', err)
        setError('Failed to load cart items')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCart()
  }, [router])

  // Calculate subtotal in rupees
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.quantity * item.plant.price * rupeeConversionRate),
    0
  )

  // Calculate tax (18% GST)
  const tax = subtotal * 0.18

  // Calculate shipping (flat fee of ₹450 or free for orders over ₹3750)
  const shipping = subtotal > 3750 ? 0 : 450

  // Calculate order total
  const orderTotal = subtotal + tax + shipping

  // Handle image error
  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }))
  }

  // Get plant image
  const getPlantImage = (item: CartItem) => {
    if (imageErrors[item.id]) {
      return item.plant.fallbackImage
    }
    return item.plant.image
  }

  // Update item quantity
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setIsUpdating(prev => ({ ...prev, [itemId]: true }))

    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        router.push('/auth')
        return
      }

      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId,
          quantity: newQuantity
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update cart')
      }

      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setCartItems(prevItems => 
          prevItems.map(item => 
            item.id === itemId 
              ? { ...item, quantity: newQuantity } 
              : item
          )
        )
      }
    } catch (err) {
      console.error('Error updating cart:', err)
      alert('Failed to update item. Please try again.')
    } finally {
      setIsUpdating(prev => ({ ...prev, [itemId]: false }))
    }
  }

  // Remove item from cart
  const removeItem = async (itemId: string) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        router.push('/auth')
        return
      }

      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId,
          quantity: 0 // Setting quantity to 0 removes the item
        })
      })

      if (!response.ok) {
        throw new Error('Failed to remove item')
      }

      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId))
      }
    } catch (err) {
      console.error('Error removing item:', err)
      alert('Failed to remove item. Please try again.')
    }
  }

  // Clear cart
  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return

    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        router.push('/auth')
        return
      }

      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to clear cart')
      }

      const data = await response.json()
      
      if (data.success) {
        setCartItems([])
      }
    } catch (err) {
      console.error('Error clearing cart:', err)
      alert('Failed to clear cart. Please try again.')
    }
  }

  // Handle checkout
  const handleCheckout = () => {
    alert('Proceeding to checkout...')
    // In a real application, you would redirect to a checkout page
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f0faf0]">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#2e7d32] mb-6">{t.title}</h1>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">{t.loading}</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-red-500 mb-4">{t.error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#22c55e] text-white px-4 py-2 rounded-lg hover:bg-[#1ea550] transition-colors"
            >
              {t.tryAgain}
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6">
              <svg className="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-xl text-gray-600 mb-6">{t.emptyCart}</p>
            <Link 
              href="/shop" 
              className="inline-flex items-center bg-[#22c55e] text-white px-4 py-2 rounded-lg hover:bg-[#1ea550] transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              {t.continueShopping}
            </Link>
          </div>
        ) : (
          <div className="lg:flex lg:gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 border border-[#e0f0e0]">
                <table className="w-full">
                  <thead className="bg-[#e8f5e9] border-b border-[#e0f0e0]">
                    <tr>
                      <th className="py-4 px-6 text-left text-sm font-medium text-[#2e7d32] uppercase tracking-wider hidden md:table-cell">{t.product}</th>
                      <th className="py-4 px-6 text-left text-sm font-medium text-[#2e7d32] uppercase tracking-wider hidden md:table-cell">{t.price}</th>
                      <th className="py-4 px-6 text-left text-sm font-medium text-[#2e7d32] uppercase tracking-wider">{t.quantity}</th>
                      <th className="py-4 px-6 text-right text-sm font-medium text-[#2e7d32] uppercase tracking-wider hidden md:table-cell">{t.total}</th>
                      <th className="py-4 px-6 text-right text-sm font-medium text-[#2e7d32] uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0f0e0]">
                    {cartItems.map((item) => (
                      <tr key={item.id} className="hover:bg-[#f5fbf5]">
                        <td className="py-4 px-6 md:flex items-center">
                          <div className="w-20 h-20 mr-4 relative flex-shrink-0 hidden md:block">
                            <Image
                              src={getPlantImage(item)}
                              alt={item.plant.name[locale as keyof typeof item.plant.name]}
                              fill
                              className="object-cover rounded"
                              onError={() => handleImageError(item.id)}
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">
                              {item.plant.name[locale as keyof typeof item.plant.name]}
                            </h3>
                            <p className="text-sm text-gray-500 italic hidden md:block">
                              {item.plant.scientificName}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-700 hidden md:table-cell">
                          ₹{(item.plant.price * rupeeConversionRate).toFixed(0)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <button 
                              className="w-8 h-8 bg-gray-100 rounded-l flex items-center justify-center text-gray-700 border border-r-0 border-gray-200"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={isUpdating[item.id] || item.quantity <= 1}
                            >
                              <FaMinus className="text-xs" />
                            </button>
                            <input 
                              type="text" 
                              value={item.quantity}
                              readOnly
                              className="w-10 h-8 text-center border-t border-b border-gray-200 text-gray-700"
                            />
                            <button 
                              className="w-8 h-8 bg-gray-100 rounded-r flex items-center justify-center text-gray-700 border border-l-0 border-gray-200"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={isUpdating[item.id]}
                            >
                              <FaPlus className="text-xs" />
                            </button>
                            {isUpdating[item.id] && (
                              <span className="ml-2">
                                <div className="w-4 h-4 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin"></div>
                              </span>
                            )}
                          </div>
                          <div className="md:hidden mt-2 flex justify-between">
                            <span className="text-sm text-gray-500">₹{(item.plant.price * rupeeConversionRate).toFixed(0)} each</span>
                            <span className="text-sm font-medium">₹{(item.quantity * item.plant.price * rupeeConversionRate).toFixed(0)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right font-medium text-gray-700 hidden md:table-cell">
                          ₹{(item.quantity * item.plant.price * rupeeConversionRate).toFixed(0)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            className="text-red-500 hover:text-red-700 transition-colors"
                            onClick={() => removeItem(item.id)}
                            title={t.removeItem}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <Link 
                  href="/shop" 
                  className="inline-flex items-center text-[#22c55e] hover:text-[#1ea550] transition-colors"
                >
                  <FaArrowLeft className="mr-2" />
                  {t.continueShopping}
                </Link>
                
                <button 
                  className="text-red-500 hover:text-red-700 transition-colors inline-flex items-center"
                  onClick={clearCart}
                >
                  <FaTrash className="mr-2" />
                  {t.clearCart}
                </button>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6 border border-[#e0f0e0]">
                <h2 className="text-lg font-bold text-[#2e7d32] mb-4">{t.orderSummary}</h2>
                
                <div className="border-b border-[#e0f0e0] pb-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{t.subtotal}</span>
                    <span className="font-medium">₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{t.shipping}</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Free' : `₹${shipping.toFixed(0)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.tax}</span>
                    <span className="font-medium">₹{tax.toFixed(0)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-[#2e7d32]">{t.orderTotal}</span>
                  <span className="text-xl font-bold text-[#22c55e]">₹{orderTotal.toFixed(0)}</span>
                </div>
                
                <button 
                  className="w-full bg-[#22c55e] text-white py-3 rounded-lg hover:bg-[#1ea550] transition-colors font-medium"
                  onClick={handleCheckout}
                >
                  {t.checkout}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  )
} 