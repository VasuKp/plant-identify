'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../components/Navigation'
import Footer from '../components/Footer'
import { useLanguage } from '../context/languagecontext'
import { BiArrowBack } from 'react-icons/bi'
import { FaCreditCard, FaMoneyBill, FaCheckCircle } from 'react-icons/fa'

export default function Checkout() {
  const router = useRouter()
  const { locale } = useLanguage()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [cartTotal, setCartTotal] = useState(0)
  
  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  })
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    nameOnCard: '',
    expiry: '',
    cvv: '',
    saveCard: false,
    paymentMethod: 'card'
  })
  
  const [errors, setErrors] = useState({})
  
  // Load cart items
  useEffect(() => {
    // Simulate fetching cart data
    const fetchCart = async () => {
      // In a real app, this would be a fetch call to your API
      setTimeout(() => {
        const sampleCart = [
          {
            id: '1',
            name: {
              en: 'Monstera Deliciosa',
              hi: 'मॉन्स्टेरा डेलिसिओसा',
              gu: 'મોન્સ્ટેરા ડેલિસિઓસા'
            },
            price: 29.99,
            quantity: 1
          },
          {
            id: '5',
            name: {
              en: 'Fiddle Leaf Fig',
              hi: 'फिडल लीफ फिग', 
              gu: 'ફિડલ લીફ ફિગ'
            },
            price: 49.99,
            quantity: 2
          }
        ]
        
        setCartItems(sampleCart)
        
        // Calculate total
        const total = sampleCart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        setCartTotal(total)
      }, 500)
    }
    
    fetchCart()
  }, [])
  
  // Handle shipping form change
  const handleShippingChange = (e) => {
    const { name, value } = e.target
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Handle payment form change
  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target
    setPaymentInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }
  
  // Handle shipping form submission
  const handleShippingSubmit = (e) => {
    e.preventDefault()
    
    // Validate shipping info
    const newErrors = {}
    if (!shippingInfo.name) newErrors.name = 'Name is required'
    if (!shippingInfo.email) newErrors.email = 'Email is required'
    if (!shippingInfo.phone) newErrors.phone = 'Phone is required'
    if (!shippingInfo.address) newErrors.address = 'Address is required'
    if (!shippingInfo.city) newErrors.city = 'City is required'
    if (!shippingInfo.state) newErrors.state = 'State is required'
    if (!shippingInfo.zip) newErrors.zip = 'ZIP code is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Clear errors and move to payment step
    setErrors({})
    setStep(2)
  }
  
  // Handle payment form submission
  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    
    // Validate payment info if credit card is selected
    const newErrors = {}
    if (paymentInfo.paymentMethod === 'card') {
      if (!paymentInfo.cardNumber) newErrors.cardNumber = 'Card number is required'
      if (!paymentInfo.nameOnCard) newErrors.nameOnCard = 'Name on card is required'
      if (!paymentInfo.expiry) newErrors.expiry = 'Expiry date is required'
      if (!paymentInfo.cvv) newErrors.cvv = 'CVV is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Process payment
    setLoading(true)
    
    try {
      // In a real app, this would be a call to your payment processor API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Handle successful payment
      setOrderComplete(true)
      setStep(3)
      
      // In a real app, you would clear the cart here
    } catch (error) {
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const handlePaymentMethodChange = (method) => {
    setPaymentInfo(prev => ({
      ...prev,
      paymentMethod: method
    }))
  }
  
  // Rupee conversion rate
  const rupeeConversionRate = 75
  
  // Get cart total in rupees
  const cartTotalRupees = (cartTotal * rupeeConversionRate).toFixed(0)
  
  // Tax (18% GST)
  const tax = cartTotal * 0.18
  const taxRupees = (tax * rupeeConversionRate).toFixed(0)
  
  // Shipping (₹450 or free for orders over ₹3750)
  const shippingFee = cartTotal * rupeeConversionRate > 3750 ? 0 : 450
  
  // Order total
  const orderTotal = cartTotal + tax + (shippingFee / rupeeConversionRate)
  const orderTotalRupees = (orderTotal * rupeeConversionRate).toFixed(0)
  
  return (
    <div className="bg-[#f0faf0] min-h-screen">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2e7d32]">Checkout</h1>
          <Link href="/cart" className="flex items-center text-[#2e7d32] hover:text-[#22c55e]">
            <BiArrowBack className="mr-2" />
            <span>Back to Cart</span>
          </Link>
        </div>
        
        {/* Checkout Steps */}
        <div className="flex mb-8 justify-center">
          <div className={`flex flex-col items-center ${step >= 1 ? 'text-[#22c55e]' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#22c55e] text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="mt-2">Shipping</span>
          </div>
          <div className={`w-24 h-1 mt-5 ${step >= 2 ? 'bg-[#22c55e]' : 'bg-gray-200'}`}></div>
          <div className={`flex flex-col items-center ${step >= 2 ? 'text-[#22c55e]' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#22c55e] text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="mt-2">Payment</span>
          </div>
          <div className={`w-24 h-1 mt-5 ${step >= 3 ? 'bg-[#22c55e]' : 'bg-gray-200'}`}></div>
          <div className={`flex flex-col items-center ${step >= 3 ? 'text-[#22c55e]' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-[#22c55e] text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="mt-2">Confirmation</span>
          </div>
        </div>
        
        <div className="md:flex gap-8">
          {/* Main Content */}
          <div className="md:w-2/3">
            {/* Shipping Info (Step 1) */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-[#2e7d32] mb-6">Shipping Information</h2>
                
                <form onSubmit={handleShippingSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]`}
                        value={shippingInfo.name}
                        onChange={handleShippingChange}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]`}
                        value={shippingInfo.email}
                        onChange={handleShippingChange}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]`}
                        value={shippingInfo.phone}
                        onChange={handleShippingChange}
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 mb-2" htmlFor="address">Address</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        className={`w-full px-4 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]`}
                        value={shippingInfo.address}
                        onChange={handleShippingChange}
                      />
                      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        className={`w-full px-4 py-2 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]`}
                        value={shippingInfo.city}
                        onChange={handleShippingChange}
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="state">State</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        className={`w-full px-4 py-2 border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]`}
                        value={shippingInfo.state}
                        onChange={handleShippingChange}
                      />
                      {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="zip">PIN Code</label>
                      <input
                        type="text"
                        id="zip"
                        name="zip"
                        className={`w-full px-4 py-2 border ${errors.zip ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]`}
                        value={shippingInfo.zip}
                        onChange={handleShippingChange}
                      />
                      {errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip}</p>}
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      className="bg-[#22c55e] text-white px-6 py-3 rounded-lg hover:bg-[#1ea550] transition-colors font-medium"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Payment Info (Step 2) */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-[#2e7d32] mb-6">Payment Method</h2>
                
                <div className="mb-6">
                  <div className="flex space-x-4 mb-6">
                    <button
                      type="button"
                      className={`flex items-center border rounded-lg px-4 py-3 ${paymentInfo.paymentMethod === 'card' ? 'border-[#22c55e] bg-[#f0faf0]' : 'border-gray-300'}`}
                      onClick={() => handlePaymentMethodChange('card')}
                    >
                      <FaCreditCard className={`mr-2 ${paymentInfo.paymentMethod === 'card' ? 'text-[#22c55e]' : 'text-gray-500'}`} />
                      <span className={paymentInfo.paymentMethod === 'card' ? 'text-[#22c55e] font-medium' : 'text-gray-700'}>Credit/Debit Card</span>
                    </button>
                    
                    <button
                      type="button"
                      className={`flex items-center border rounded-lg px-4 py-3 ${paymentInfo.paymentMethod === 'cod' ? 'border-[#22c55e] bg-[#f0faf0]' : 'border-gray-300'}`}
                      onClick={() => handlePaymentMethodChange('cod')}
                    >
                      <FaMoneyBill className={`mr-2 ${paymentInfo.paymentMethod === 'cod' ? 'text-[#22c55e]' : 'text-gray-500'}`} />
                      <span className={paymentInfo.paymentMethod === 'cod' ? 'text-[#22c55e] font-medium' : 'text-gray-700'}>Cash on Delivery</span>
                    </button>
                  </div>
                </div>
                
                <form onSubmit={handlePaymentSubmit}>
                  {paymentInfo.paymentMethod === 'card' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 mb-2" htmlFor="cardNumber">Card Number</label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          className={`w-full px-4 py-2 border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]`}
                          value={paymentInfo.cardNumber}
                          onChange={handlePaymentChange}
                        />
                        {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 mb-2" htmlFor="nameOnCard">Name on Card</label>
                        <input
                          type="text"
                          id="nameOnCard"
                          name="nameOnCard"
                          className={`w-full px-4 py-2 border ${errors.nameOnCard ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]`}
                          value={paymentInfo.nameOnCard}
                          onChange={handlePaymentChange}
                        />
                        {errors.nameOnCard && <p className="text-red-500 text-sm mt-1">{errors.nameOnCard}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2" htmlFor="expiry">Expiry Date</label>
                        <input
                          type="text"
                          id="expiry"
                          name="expiry"
                          placeholder="MM/YY"
                          className={`w-full px-4 py-2 border ${errors.expiry ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]`}
                          value={paymentInfo.expiry}
                          onChange={handlePaymentChange}
                        />
                        {errors.expiry && <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2" htmlFor="cvv">CVV</label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          placeholder="123"
                          className={`w-full px-4 py-2 border ${errors.cvv ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]`}
                          value={paymentInfo.cvv}
                          onChange={handlePaymentChange}
                        />
                        {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="saveCard"
                            className="mr-2 w-4 h-4 text-[#22c55e] focus:ring-[#22c55e] border-gray-300 rounded"
                            checked={paymentInfo.saveCard}
                            onChange={handlePaymentChange}
                          />
                          <span className="text-gray-700">Save card for future purchases</span>
                        </label>
                      </div>
                    </div>
                  )}
                  
                  {paymentInfo.paymentMethod === 'cod' && (
                    <div className="bg-[#f0faf0] p-4 rounded-lg border border-[#c8e6c9] mb-6">
                      <p className="text-gray-700">You'll pay at the time of delivery. Please ensure you have the exact amount of ₹{orderTotalRupees} ready.</p>
                    </div>
                  )}
                  
                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      className="border border-[#22c55e] text-[#22c55e] px-6 py-3 rounded-lg hover:bg-[#f0faf0] transition-colors font-medium"
                      onClick={() => setStep(1)}
                    >
                      Back to Shipping
                    </button>
                    
                    <button
                      type="submit"
                      className="bg-[#22c55e] text-white px-6 py-3 rounded-lg hover:bg-[#1ea550] transition-colors font-medium flex items-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Complete Order'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Order Confirmation (Step 3) */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 text-[#22c55e]">
                  <FaCheckCircle className="w-full h-full" />
                </div>
                
                <h2 className="text-2xl font-bold text-[#2e7d32] mb-4">Order Placed Successfully!</h2>
                <p className="text-gray-600 mb-8">Thank you for your purchase. Your order has been placed and will be processed soon.</p>
                
                <div className="bg-[#f0faf0] p-4 rounded-lg border border-[#c8e6c9] mb-6 text-left">
                  <h3 className="font-medium text-[#2e7d32] mb-2">Order Details</h3>
                  <p className="text-gray-700">Order Number: <span className="font-medium">PI-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span></p>
                  <p className="text-gray-700">Total Amount: <span className="font-medium">₹{orderTotalRupees}</span></p>
                  <p className="text-gray-700">Payment Method: <span className="font-medium">{paymentInfo.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}</span></p>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Link
                    href="/shop"
                    className="bg-white border border-[#22c55e] text-[#22c55e] px-6 py-3 rounded-lg hover:bg-[#f0faf0] transition-colors font-medium"
                  >
                    Continue Shopping
                  </Link>
                  
                  <Link
                    href="/profile"
                    className="bg-[#22c55e] text-white px-6 py-3 rounded-lg hover:bg-[#1ea550] transition-colors font-medium"
                  >
                    View My Orders
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Order Summary */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-[#2e7d32] mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800">{item.name[locale] || item.name.en}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-800">₹{(item.price * item.quantity * rupeeConversionRate).toFixed(0)}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{cartTotalRupees}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (18% GST)</span>
                  <span>₹{taxRupees}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shippingFee > 0 ? `₹${shippingFee}` : 'Free'}</span>
                </div>
              </div>
              
              <div className="flex justify-between mt-4 text-lg font-bold">
                <span className="text-gray-800">Total</span>
                <span className="text-[#22c55e]">₹{orderTotalRupees}</span>
              </div>
              
              {shippingFee === 0 && (
                <div className="mt-4 bg-[#f0faf0] p-3 rounded-lg border border-[#c8e6c9] text-sm text-[#2e7d32]">
                  You've received free shipping on this order!
                </div>
              )}
              
              {step === 1 && (
                <button
                  type="button"
                  className="w-full mt-6 bg-[#22c55e] text-white py-3 rounded-lg hover:bg-[#1ea550] transition-colors font-medium"
                  onClick={handleShippingSubmit}
                >
                  Continue to Payment
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 