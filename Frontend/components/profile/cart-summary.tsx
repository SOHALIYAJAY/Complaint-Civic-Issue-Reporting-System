'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  category: string
}

export default function CartSummary() {
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
            { id: '1', name: 'Street Light Repair', price: 500, quantity: 1, category: 'Infrastructure' },
            { id: '2', name: 'Garbage Collection Service', price: 200, quantity: 2, category: 'Sanitation' },
            { id: '3', name: 'Road Maintenance', price: 1500, quantity: 1, category: 'Infrastructure' }
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
            { id: '1', name: 'Street Light Repair', price: 500, quantity: 1, category: 'Infrastructure' },
            { id: '2', name: 'Garbage Collection Service', price: 200, quantity: 2, category: 'Sanitation' },
            { id: '3', name: 'Road Maintenance', price: 1500, quantity: 1, category: 'Infrastructure' }
          ])
        }
      } catch (error) {
        console.error('Error fetching cart data:', error)
        // Set fallback cart data
        setCartItems([
          { id: '1', name: 'Street Light Repair', price: 500, quantity: 1, category: 'Infrastructure' },
          { id: '2', name: 'Garbage Collection Service', price: 200, quantity: 2, category: 'Sanitation' },
          { id: '3', name: 'Road Maintenance', price: 1500, quantity: 1, category: 'Infrastructure' }
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

  if (loading) {
    return (
      <Card className="bg-white border border-gray-200 shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-200"></div>
          <span className="ml-3 text-gray-600">Loading cart...</span>
        </div>
      </Card>
    )
  }
}
