'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  category: string
  description: string
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('access_token')
        
        if (!token) {
          // Set fallback cart data
          setCartItems([
            { 
              id: '1', 
              name: 'Street Light Repair', 
              price: 500, 
              quantity: 1, 
              category: 'Infrastructure',
              description: 'Repair damaged street light in residential area'
            },
            { 
              id: '2', 
              name: 'Garbage Collection Service', 
              price: 200, 
              quantity: 2, 
              category: 'Sanitation',
              description: 'Monthly garbage collection service for residential areas'
            },
            { 
              id: '3', 
              name: 'Road Maintenance', 
              price: 1500, 
              quantity: 1, 
              category: 'Infrastructure',
              description: 'Annual road maintenance and repair services'
            }
          ])
          return
        }

        // Fetch cart items from API
        const response = await fetch(`${(typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'}/api/cart/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setCartItems(data.cart_items || [])
        } else {
          // Set fallback cart data on error
          setCartItems([
            { 
              id: '1', 
              name: 'Street Light Repair', 
              price: 500, 
              quantity: 1, 
              category: 'Infrastructure',
              description: 'Repair damaged street light in residential area'
            },
            { 
              id: '2', 
              name: 'Garbage Collection Service', 
              price: 200, 
              quantity: 2, 
              category: 'Sanitation',
              description: 'Monthly garbage collection service for residential areas'
            },
            { 
              id: '3', 
              name: 'Road Maintenance', 
              price: 1500, 
              quantity: 1, 
              category: 'Infrastructure',
              description: 'Annual road maintenance and repair services'
            }
          ])
        }
      } catch (error) {
        console.error('Error fetching cart data:', error)
        // Set fallback cart data
        setCartItems([
          { 
            id: '1', 
            name: 'Street Light Repair', 
            price: 500, 
            quantity: 1, 
            category: 'Infrastructure',
            description: 'Repair damaged street light in residential area'
          },
          { 
            id: '2', 
            name: 'Garbage Collection Service', 
            price: 200, 
            quantity: 2, 
            category: 'Sanitation',
            description: 'Monthly garbage collection service for residential areas'
          },
          { 
            id: '3', 
            name: 'Road Maintenance', 
            price: 1500, 
            quantity: 1, 
            category: 'Infrastructure',
            description: 'Annual road maintenance and repair services'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchCartData()
  }, [])

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 0) return
    
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id))
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getSubtotal = () => {
    return getTotalPrice()
  }

  const getTax = () => {
    return Math.round(getSubtotal() * 0.18) // 18% tax
  }

  const getTotal = () => {
    return getSubtotal() + getTax()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-200"></div>
            <span className="ml-4 text-gray-600">Loading cart...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <Link 
            href="/profile" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="bg-white border border-gray-200 shadow-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {getTotalItems()} items
                  </span>
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 text-lg font-medium">Your cart is empty</p>
                    <p className="text-gray-500 mt-2">Add services to your cart to get started</p>
                    <Link 
                      href="/dashboard" 
                      className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Browse Services
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-xl font-bold text-gray-600">
                              {item.category.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{item.category}</p>
                            <p className="text-gray-800 mt-2">{item.description}</p>
                            <p className="text-2xl font-bold text-gray-900">â‚¹{item.price.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <span className="w-12 text-center font-semibold text-lg">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 rounded-lg hover:bg-red-100 transition-colors text-red-600"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white border border-gray-200 shadow-md">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">â‚¹{getSubtotal().toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span className="font-semibold text-gray-900">â‚¹{getTax().toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-green-600">â‚¹{getTotal().toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

