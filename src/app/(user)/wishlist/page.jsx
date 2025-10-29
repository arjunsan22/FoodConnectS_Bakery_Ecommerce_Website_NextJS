// src/app/(user)/wishlist/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon as HeartIconSolid, TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { HeartIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

// In wishlist/page.jsx
useEffect(() => {
  const loadWishlist = () => {
    try {
      const saved = localStorage.getItem('wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure we're working with an array and filter out any null/undefined values
        const validIds = Array.isArray(parsed) 
          ? parsed.filter(id => id && typeof id === 'string')
          : [];
        setWishlist(validIds);
        console.log('Loaded wishlist from localStorage:', validIds);
      } else {
        setWishlist([]); // Initialize empty if nothing saved
      }
    } catch (e) {
      console.error('Failed to load wishlist:', e);
      setError('Failed to load wishlist');
      setWishlist([]);
    }
  };

  loadWishlist();
  
  // Sync across tabs
  window.addEventListener('storage', loadWishlist);
  return () => window.removeEventListener('storage', loadWishlist);
}, []);
  // Fetch products data for wishlist items
  useEffect(() => {
    if (wishlist.length === 0) {
      setIsLoading(false);
      return;
    }

// In the fetchWishlistProducts function
// Update the fetchWishlistProducts function
const fetchWishlistProducts = async () => {
  try {
    console.log('Fetching products for wishlist IDs:', wishlist);
    if (wishlist.length === 0) {
      setProducts([]);
      setIsLoading(false);
      return;
    }
    
    // Add credentials and proper error handling
    const response = await fetch(`/api/user/products?ids=${wishlist.join(',')}`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Fetched products:', data);
      // Make sure you're accessing the correct property from your API response
      setProducts(Array.isArray(data) ? data : []); 
    } else {
      console.error('Failed to fetch wishlist products:', await response.text());
      setProducts([]);
    }
  } catch (error) {
    console.error('Error fetching wishlist products:', error);
    setProducts([]);
  } finally {
    setIsLoading(false);
  }
};
    fetchWishlistProducts();
  }, [wishlist]);

// Update removeFromWishlist to trigger storage event
const removeFromWishlist = (productId) => {
  const newWishlist = wishlist.filter(id => id !== productId);
  setWishlist(newWishlist);
  localStorage.setItem('wishlist', JSON.stringify(newWishlist));
  // Dispatch storage event for cross-tab sync
  window.dispatchEvent(new Event('storage'));
  showToast('Removed from wishlist');
};

  const addToCart = async (product) => {
    try {
      const res = await fetch('/api/user/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });

      if (res.ok) {
        showToast('Added to cart!', 'success');
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to add to cart', 'error');
      }
    } catch (error) {
      console.log('Add to cart error:', error);
      showToast('Unable to connect to server', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Wishlist</h1>
          <Link
            href="/shop"
            className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium"
          >
            Continue Shopping
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <HeartIcon className="h-16 w-16 mx-auto text-gray-300" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Your wishlist is empty</h2>
            <p className="mt-2 text-gray-600">Save your fawhat vorite items here to find them later</p>
            <div className="mt-6">
              <Link
                href="/shop"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {products.map((product) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <Link href={`/products/${product._id}`} className="block">
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={400}
                            height={400}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                      </div>
                    </Link>
                    
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-500 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                    
                    {product.productOffer > 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {product.productOffer}% OFF
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 line-clamp-1">
                      <Link href={`/products/${product._id}`} className="hover:text-orange-500 transition-colors">
                        {product.name}
                      </Link>
                    </h3>
                    
                    <div className="mt-2">
                      {product.productOffer > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            ₹{(product.price * (1 - product.productOffer / 100)).toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          ₹{product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        {product.status === 'available' ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-xs text-gray-600">In Stock</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-xs text-gray-600">Out of Stock</span>
                          </>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(product);
                        }}
                        className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
                        aria-label="Add to cart"
                      >
                        <ShoppingCartIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
  <AnimatePresence mode="wait">
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      transition={{ type: "spring", damping: 15 }}
      className="fixed top-6 right-6 z-50"
    >
      <div
        className={`relative overflow-hidden px-5 py-4 rounded-2xl backdrop-blur-xl border-2 shadow-2xl
          ${toast.type === "success" 
            ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-300/50" 
            : "bg-gradient-to-br from-rose-500 to-pink-600 border-rose-300/50"}`}
      >
        {/* Shine animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ["-200%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative flex items-center gap-3">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
          >
            {toast.type === "success" ? (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <motion.path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </motion.div>

          {/* Message */}
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-white font-semibold text-sm pr-8"
          >
            {toast.message}
          </motion.p>

          {/* Close button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setToast({ show: false })}
            className="absolute right-3 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        {/* Progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-white/40"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 3, ease: "linear" }}
        />

        {/* Glow */}
        <div className={`absolute -inset-1 rounded-2xl blur-xl opacity-50 -z-10
          ${toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`} 
        />
      </div>
    </motion.div>
  </AnimatePresence>
)}
    </div>
  );
}