'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { HeartIcon, ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { showToast } from '../../../../lib/toast';
import LoadingSpinner from '../../../LoadingSpinner';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlist, setWishlist] = useState(new Set());
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Load wishlist
  useEffect(() => {
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

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/user/products?id=${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setProduct(data[0]);
            const unit = data[0].unit;
            setQuantity(unit === 'kg' || unit === 'litre' ? 0.5 : 1);
          }
        }
      } catch (error) {
        console.error('Failed to load product', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch related products
  useEffect(() => {
    if (!product?._id || !product?.category?._id) return;
    const fetchRelated = async () => {
      setLoadingRelated(true);
      try {
        const res = await fetch(
          `/api/user/products/related?productId=${product._id}&categoryId=${product.category._id}`
        );
        if (res.ok) {
          const data = await res.json();
          setRelatedProducts(data);
        }
      } catch (err) {
        console.error('Failed to load related products', err);
      } finally {
        setLoadingRelated(false);
      }
    };
    fetchRelated();
  }, [product?._id, product?.category?._id]);

  if (isLoading) return <LoadingSpinner />;
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
        <a href="/shop" className="text-blue-600 hover:underline">← Back to Shop</a>
      </div>
    );
  }

  const isWishlisted = wishlist.has(product._id);
  const isAvailable = product.status === 'available' && product.quantity > 0 && !product.blocked;

  const toggleWishlist = () => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(product._id)) {
      newWishlist.delete(product._id);
    } else {
      newWishlist.add(product._id);
    }
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify([...newWishlist]));
  };

  const changeQuantity = (delta) => {
    const unit = product.unit;
    const step = unit === 'kg' || unit === 'litre' ? 0.5 : 1;
    const newQty = quantity + delta;

    if (newQty < step) return;
    if (newQty > product.quantity) return;

    setQuantity(parseFloat(newQty.toFixed(1)));
  };

  const addToCart = async () => {
    if (!isAvailable) {
      showToast('Product is not available', 'error');
      return;
    }

    try {
      const res = await fetch('/api/user/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: product._id, 
          quantity: quantity || 1 
        }),
        credentials: 'include'
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
      showToast(error.message, 'error');
    }
  };

  // Submit review
  const submitReview = async (e) => {
    e.preventDefault();

    if (!session) {
      showToast('Please log in to submit a review', 'error');
      return;
    }

    if (rating === 0) {
      showToast('Please select a rating', 'error');
      return;
    }

    if (comment.trim().length > 600) {
      showToast('Comment must be 600 characters or less', 'error');
      return;
    }

    setIsSubmittingReview(true);

    try {
      const res = await fetch('/api/user/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          rating,
          comment: comment.trim()
        }),
        credentials: 'include'
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Review submitted successfully!', 'success');
        setShowReviewForm(false);
        setRating(0);
        setComment('');
        // Refresh product data to show new review
        const refreshRes = await fetch(`/api/user/products?id=${id}`);
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData && refreshData.length > 0) {
            setProduct(refreshData[0]);
          }
        }
      } else {
        switch (res.status) {
          case 401:
            showToast('Please log in to submit a review', 'error');
            break;
          case 403:
            showToast('Please purchase and receive this product before reviewing', 'error');
            break;
          case 409:
            showToast('You have already reviewed this product', 'error');
            break;
          default:
            showToast(data.error || 'Failed to submit review', 'error');
        }
      }
    } catch (error) {
      console.error('Review submission error:', error);
      showToast('Failed to submit review. Please try again', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const finalPrice = product.productOffer > 0
    ? product.price * (1 - product.productOffer / 100)
    : product.price;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => setIsZooming(true);
  const handleMouseLeave = () => setIsZooming(false);

  const stepLabel = product.unit === 'kg' || product.unit === 'litre' ? '0.5' : '1';

  // Calculate average rating
  const avgRating = product.reviews?.length > 0
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      {/* Back Link */}
      <div className="mb-8">
        <a 
          href="/shop" 
          className="inline-flex items-center text-gray-600 hover:text-orange-500 transition-colors duration-300 group"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Shop
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-6">
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
            {product.images?.[selectedImage] ? (
              <div
                className="relative w-full h-[32rem] overflow-hidden"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    isZooming ? 'scale-110' : 'scale-100'
                  }`}
                  style={{
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center rounded-2xl">
                <span className="text-gray-400">No Image Available</span>
              </div>
            )}

            <button
              onClick={toggleWishlist}
              className={`absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-all duration-300 z-10 ${
                isWishlisted ? 'animate-pulse' : ''
              }`}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {isWishlisted ? (
                <HeartIconSolid className="h-6 w-6 text-red-500" />
              ) : (
                <HeartIcon className="h-6 w-6 text-gray-400 hover:text-red-500 transition-colors" />
              )}
            </button>
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-lg">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedImage === index 
                      ? 'border-orange-500 ring-2 ring-orange-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`thumbnail-${index}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500">
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {isAvailable ? (
                    <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                  ) : (
                    <h1 className="text-3xl font-bold text-red-900 animate-pulse">
                      {product.name}
                    </h1>
                  )}

                  {isAvailable ? (
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div className="absolute w-2 h-2 rounded-full bg-green-500 animate-ping opacity-20"></div>
                      </div>
                      <span className="text-green-600 font-medium text-xs">Live — Buy Now</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-red-600 font-medium text-xs">Not Available</span>
                    </div>
                  )}
                </div>

                {/* Rating Display */}
                {product.reviews?.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIconSolid
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {avgRating} ({product.reviews.length} {product.reviews.length === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}
              </div>

              {product.category && (
                <span className="inline-block bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 text-xs font-medium px-3 py-1 rounded-full">
                  {product.category.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mb-6">
              {product.productOffer > 0 ? (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{finalPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ₹{product.price.toFixed(2)}
                    </span>
                    <span className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full">
                      {product.productOffer}% OFF
                    </span>
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    You save ₹{(product.price - finalPrice).toFixed(2)}
                  </div>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  ₹{product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Product Details</h3>
            <p className="text-gray-600 leading-relaxed border-l-4 border-orange-200 pl-4 py-1">
              {product.description}
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity (step: {stepLabel} {product.unit})
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg w-fit">
              <button
                onClick={() => changeQuantity(- (product.unit === 'kg' || product.unit === 'litre' ? 0.5 : 1))}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={quantity <= (product.unit === 'kg' || product.unit === 'litre' ? 0.5 : 1)}
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <span className="px-4 py-2 min-w-[60px] text-center font-medium">
                {quantity} {product.unit}
              </span>
              <button
                onClick={() => changeQuantity(product.unit === 'kg' || product.unit === 'litre' ? 0.5 : 1)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={quantity >= product.quantity}
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Available: {product.quantity} {product.unit}
            </p>
          </div>

          {/* Add to Cart Button */}
          <div className="mb-8">
            <button
              onClick={addToCart}
              disabled={!isAvailable}
              className={`w-full py-4 px-6 font-medium rounded-xl flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer ${
                isAvailable
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-200 hover:scale-[1.02]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span>{isAvailable ? 'Add to Cart' : 'Out of Stock'}</span>
            </button>
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600">Unit:</span>
              <span className="font-medium text-gray-800">{product.unit}</span>
            </div>
            <div className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600">Available Quantity:</span>
              {product.quantity < 5 ? (
                <span className="font-medium text-red-600">
                  Hurry! Only {product.quantity} left
                </span>
              ) : (
                <span className="font-medium text-green-600">
                  In Stock ({product.quantity} available)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          {session && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-300 cursor-pointer"
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={submitReview} className="mb-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Share Your Experience</h3>
            
            {/* Star Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    {star <= (hoverRating || rating) ? (
                      <StarIconSolid className="h-8 w-8 text-yellow-400" />
                    ) : (
                      <StarIcon className="h-8 w-8 text-gray-300" />
                    )}
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-gray-600">
                    {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={600}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder="Share your thoughts about this product..."
              />
              <p className="mt-1 text-xs text-gray-500 text-right">
                {comment.length}/600 characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmittingReview || rating === 0}
              className="cursor-pointer w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-6">
            {product.reviews.map((review, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white font-bold">
                    {review.userName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {review.userName|| 'Anonymous'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIconSolid
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Verified Purchase
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 leading-relaxed mt-2">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <StarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>

      {/* Related Products */}
      {!loadingRelated && relatedProducts.length > 0 && (
        <div className="mt-16 animate-fadeIn">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
          <div className="flex overflow-x-auto pb-6 space-x-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {relatedProducts.map((prod) => (
              <div
                key={prod._id}
                className="flex-shrink-0 w-64 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <a href={`/products/${prod._id}`} className="block">
                  {prod.images?.[0] ? (
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm">
                      {prod.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      {prod.productOffer > 0 ? (
                        <>
                          <span className="text-lg font-bold text-gray-900">
                            ₹{((1 - prod.productOffer / 100) * prod.price).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500 line-through">
                            ₹{prod.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          ₹{prod.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex justify-between items-center text-xs text-gray-600">
                      <span>{prod.unit}</span>
                      {prod.category?.name && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                          {prod.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Icons
function PlusIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
}

function MinusIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
    </svg>
  );
}