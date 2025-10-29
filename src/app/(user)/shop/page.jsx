'use client';
import { useState, useEffect, useMemo } from 'react';
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { motion } from "framer-motion";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import Swal from 'sweetalert2';
import LoadingSpinner from '../../LoadingSpinner';
import Link from 'next/link';
import Toast from '../../components/Toast';

export default function ShopPage() {
  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000]); // [min, max]
  const [sortOption, setSortOption] = useState('newest'); // 'newest', 'price-low', 'price-high'
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 5;

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/user/products'),
          fetch('/api/user/categories')
        ]);

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
        }
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

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

  // Compute filtered & sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category?._id === selectedCategory);
    }

    // Price filter
    result = result.filter(p => {
      const price = p.productOffer > 0 
        ? p.price * (1 - p.productOffer / 100) 
        : p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sorting
    result.sort((a, b) => {
      const priceA = a.productOffer > 0 ? a.price * (1 - a.productOffer / 100) : a.price;
      const priceB = b.productOffer > 0 ? b.price * (1 - b.productOffer / 100) : b.price;

      switch (sortOption) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        default:
          return 0;
      }
    });

    return result;
  }, [products, selectedCategory, priceRange, sortOption]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  // Handlers
  const toggleWishlist = (id) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(id)) {
      newWishlist.delete(id);
    } else {
      newWishlist.add(id);
    }
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify([...newWishlist]));
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
      body: JSON.stringify({ 
        productId: product._id, 
        quantity: 1 
      }),
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceRange, sortOption]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Product Card Component (same as yours)
  const ProductCard = ({ product }) => {
    const isWishlisted = wishlist.has(product._id);
    const finalPrice = product.productOffer > 0 
      ? product.price * (1 - product.productOffer / 100) 
      : product.price;
      const avgRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;
  const roundedRating = Math.round(avgRating); // For full-star display (or use Math.floor for partial)

//product card 
    return (
      <Link href={`/products/${product._id}`}>
      <div className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 w-full h-full flex flex-col cursor-pointer">
        <div className="relative flex-1 flex flex-col">
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
            onClick={() => toggleWishlist(product._id)}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
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
                    ₹{finalPrice.toFixed(2)}
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
             {product.quantity === 0 ? (
  <span className="inline-block bg-red-100 text-red-600 text-sm font-semibold px-3 py-1 rounded-full">
    ❌ Out of Stock
  </span>
) : product.quantity < 5 ? (
  <span className="inline-block bg-yellow-100 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full animate-pulse">
    ⚠️ Hurry! Few Left
  </span>
) : null}

            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">All Products</h2>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price: ₹{priceRange[0]} - ₹{priceRange[1]}
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="5000"
                step="10"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>₹0</span>
                <span>₹1000+</span>
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Reset Button */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setPriceRange([0, 1000]);
                setSortOption('newest');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition w-full"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {paginatedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products match your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-2 sm:px-0">
            {paginatedProducts.map((product) => (
              <div key={product._id} className="w-full h-full flex justify-center">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-orange-500 hover:text-white border'
                }`}
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === i + 1
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-orange-100 border'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-orange-500 hover:text-white border'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
      {/* Toast Notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.show}
          onClose={hideToast}
        />
    </div>
  );
}