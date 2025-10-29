'use client';
import { useState, useEffect } from 'react';
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { motion } from "framer-motion";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import LoginSpinner from '../LoginSpinner'
import Link from 'next/link';
import Toast from './Toast'; // ✅ Import Toast

export default function ProductsSection() {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/user/products');
        if (res.ok) {
          const data = await res.json();
          console.log('fetched products :',data)
          setProducts(data);
        }
      } catch (error) {
        console.log('Failed to load products', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

    // Load wishlist
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('wishlist');
        if (saved) {
          const parsed = JSON.parse(saved);
          setWishlist(new Set(Array.isArray(parsed) ? parsed : []));
        }
      } catch (e) {
        console.warn('Failed to parse wishlist');
        setWishlist(new Set());
      }
    }
  }, []);

// In productsSection.jsx
const toggleWishlist = (id) => {
  const newWishlist = new Set(wishlist);
  if (newWishlist.has(id)) {
    newWishlist.delete(id);
  } else {
    newWishlist.add(id);
  }
  setWishlist(newWishlist);
  // Make sure to store as an array, not a Set
  localStorage.setItem('wishlist', JSON.stringify(Array.from(newWishlist)));
};

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, show: false });
  };

  const addToCart = async (product) => {
    try {
      const res = await fetch('/api/user/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
      showToast(`${product.name} added to cart!`, 'success');
    } else {
      switch (res.status) {
        case 401:
          showToast('Please log in to add items to cart', 'error');
          break;
        case 400:
          if (data.status === 'OUT_OF_STOCK') {
            const msg = data.currentCartQty 
              ? `Out of Stock`
              : `Only ${data.availableQuantity} ${data.unit} available`;
            showToast(msg, 'error');
          } else {
            showToast(data.error, 'error');
          }
          break;
        default:
          showToast('Failed to add to cart', 'error');
      }
    }
    } catch (error) {
      console.error('Add to cart error:', error);
      showToast('Unable to connect to server', 'error');
    }
  };

  const ProductCard = ({ product }) => {
    const isWishlisted = wishlist.has(product._id);
const avgRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;
  const roundedRating = Math.round(avgRating); // For full-star display (or use Math.floor for partial)

    return (
      <Link href={`/products/${product._id}`} className="block h-full">
        <div className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 w-full h-full flex flex-col">
          <div className="relative flex-1">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
            <button
              onClick={(e) => {
                e.preventDefault(); // 🔥 Prevent navigation on wishlist click
                toggleWishlist(product._id);
              }}
              className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors z-10 cursor-pointer"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {isWishlisted ? (
                <HeartIconSolid className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>
            {product.productOffer > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {product.productOffer}% OFF
              </div>
            )}
          </div>
          <div className="p-4 flex flex-col flex-1">
            <h3 className="font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
            <div className="mt-2 flex items-center justify-between mt-auto">
              <div>
                {product.productOffer > 0 ? (
                  <>
                    <span className="text-lg font-bold text-gray-900">
                      ₹{(product.price * (1 - product.productOffer / 100)).toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ₹{product.price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-gray-900">₹{product.price.toFixed(2)}</span>
                )}
{/* ✅ Animated Star Rating Display */}
{product.reviews?.length > 0 && (
  <motion.div
    className="flex items-center gap-1 mt-1"
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    {[1, 2, 3, 4, 5].map((star) => (
      <motion.div
        key={star}
        initial={{ scale: 0, rotate: 90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          delay: star * 0.05,
          type: "spring",
          stiffness: 200,
          damping: 10,
        }}
      >
        <StarIconSolid
          className={`h-4 w-4 transition-all duration-200 ${
            star <= roundedRating
              ? "text-yellow-400 drop-shadow-[0_0_4px_rgba(255,215,0,0.6)]"
              : "text-gray-300"
          }`}
        />
      </motion.div>
    ))}
    <motion.span
      className="text-xs text-gray-500 ml-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      ({product.reviews.length})
    </motion.span>
  </motion.div>
)}
                <div className="flex items-center gap-2 mt-1">
                  {product.status === 'available' ? (
                    <>
                      <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div className="absolute w-2 h-2 rounded-full bg-green-500 animate-ping opacity-40"></div>
                      </div>
                      <span className="text-green-600 font-medium text-xs">Live — Buy Now</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-red-600 font-medium text-xs">Not Available this moment</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault(); // 🔥 Prevent navigation on cart click
                  addToCart(product);
                }}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                aria-label="Add to cart"
              >
                <ShoppingCartIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (isLoading) {
    return <LoginSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">All Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* ✅ Toast rendered ONCE at the end */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={hideToast}
      />
    </div>
  );
}