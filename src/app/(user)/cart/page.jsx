'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon, PlusIcon, MinusIcon, ArrowLeftIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { showToast } from '../../../lib/toast';

// Helper to determine step based on unit
const getStepFromUnit = (unit) => {
  if (!unit || typeof unit !== 'string') return 1;
  const lower = unit.toLowerCase();
  // Fractional units
  if (
    lower.includes('kg') ||
    lower.includes('kilogram') ||
    lower.includes('g') ||
    lower.includes('gram') ||
    lower.includes('litre') ||
    lower.includes('liter') ||
    lower.includes('ml') ||
    lower.includes('millilitre') ||
    lower.includes('milliliter')
  ) {
    return 0.5;
  }
  // Integer units
  if (
    lower.includes('pc') ||
    lower.includes('piece') ||
    lower.includes('packet') ||
    lower.includes('pack') ||
    lower.includes('unit') ||
    lower.includes('item') ||
    lower.includes('nos') ||
    lower.includes('count')
  ) {
    return 1;
  }
  // Default fallback
  return 1;
};

// Format quantity for display (e.g., 1.0 → "1", 1.5 → "1.5")
const formatQuantity = (qty) => {
  return qty % 1 === 0 ? qty.toString() : qty.toFixed(1);
};

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/user/cart');
      const data = await res.json();
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId, newQuantity) => {
    // Allow minimum 0.5 for fractional, 1 for integer — but we enforce min via UI
    if (newQuantity < 0.5) return;

    try {
      const res = await fetch('/api/user/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity: parseFloat(newQuantity.toFixed(2)) }),
      });
    const data = await res.json();
      if (res.ok) {
        await fetchCart();
              showToast('Cart updated successfully', 'success');
      }else {
      if (data.status === 'OUT_OF_STOCK') {
        showToast(`Only ${data.availableQuantity} ${data.unit} available`, 'error');
        // Update cart to show current available quantity
        await fetchCart();
      } else {
        showToast(data.error || 'Failed to update cart', 'error');
      }
    }

    } catch (error) {
      console.error('Error updating cart:', error);

    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await fetch('/api/user/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

if (isLoading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-block animate-spin-slow text-6xl mb-4">🍳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-pulse">
              Mixing flour and data... please wait 🧂💻
          </h2>
          <p className="text-gray-600 animate-fade">Please wait a moment</p>
        </div>
        
        <div className="flex gap-2 justify-center">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fade {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-fade {
          animation: fade 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-300" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-gray-600">Looks like you haven't added anything to your cart yet.</p>
            <div className="mt-6">
              <Link
                href="/shop"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <Link
            href="/shop"
            className="text-orange-500 hover:text-orange-600 flex items-center transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 ml-4">Your Cart</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.items.map((item) => {
                const step = getStepFromUnit(item.product.unit);
                const minQty = step;
              const isOutOfStock = !item.product?.quantity || item.product?.quantity <= 0 || item.product?.status !== 'available';
               return (
                  <motion.div
                    key={item.product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 
                      ${isOutOfStock ? 'opacity-60' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row relative">
                      {/* Add Out of Stock Badge */}
                      {isOutOfStock && (
                        <div className="absolute -top-3 -right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                          Out of Stock
                        </div>
                      )}
                      <div className="flex-shrink-0 w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                        {item.product.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-gray-400 text-sm">No image</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-lg font-medium text-gray-900">{item.product.name}</h3>
                          <button
                            onClick={() => removeItem(item.product._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>

                        <p className="mt-1 text-sm text-gray-500">{item.product.unit}</p>

                      <div className="mt-4 flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-200 rounded-full">
                            <button
                              onClick={() => {
                                const newQty = parseFloat((item.quantity - step).toFixed(1));
                                if (newQty >= minQty && !isOutOfStock) {
                                  updateQuantity(item.product._id, newQty);
                                }
                              }}
                              disabled={item.quantity <= minQty || isOutOfStock}
                              className={`p-2 ${
                                item.quantity <= minQty || isOutOfStock
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-500 hover:text-orange-500'
                              } transition-colors`}
                            >
                              <MinusIcon className="h-4 w-4 cursor-pointer" />
                            </button>
                            <span className="px-3 w-12 text-center">
                              {formatQuantity(item.quantity)}
                            </span>
                            <button
                              onClick={() => {
                                const newQty = parseFloat((item.quantity + step).toFixed(1));
                                if (!isOutOfStock) {
                                  updateQuantity(item.product._id, newQty);
                                }
                              }}
                              disabled={isOutOfStock}
                              className={`p-2 ${
                                isOutOfStock
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-500 hover:text-orange-500'
                              } transition-colors`}
                            >
                              <PlusIcon className="h-4 w-4 cursor-pointer" />
                            </button>
                          </div>

                          <div className="text-lg font-medium text-gray-900">
                            ₹{(item.product.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{cart.total.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-t border-gray-200 pt-4">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>

                <div className="flex justify-between border-t border-gray-200 pt-4">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">₹{cart.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-full transition-colors duration-200 flex items-center justify-center cursor-pointer"
              >
                Proceed to Checkout
              </button>

              <p className="mt-4 text-center text-sm text-gray-500">
                or{' '}
                <Link href="/shop" className="text-orange-500 hover:text-orange-600 font-medium">
                  Continue Shopping
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}