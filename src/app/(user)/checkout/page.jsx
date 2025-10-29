'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CheckoutSpinner from '../../../app/CheckoutSpinner';
import Toast from '../../components/Toast'
export default function CheckoutPage() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [cartItems, setCartItems] = useState([]);
  const [orderSummary, setOrderSummary] = useState({
    totalPrice: 0,
    discount: 0,
    finalAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false });
  const router = useRouter();

  const showToast = (message, type = 'success') => {
  setToast({ message, type, isVisible: true });
};
const hideToast = () => {
  setToast((prev) => ({ ...prev, isVisible: false }));
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cartRes, addressesRes] = await Promise.all([
          fetch('/api/user/cart', {
            credentials: 'include'
          }),
          fetch('/api/user/addresses', {
            credentials: 'include'
          })
        ]);

        if (!cartRes.ok || !addressesRes.ok) {
          throw new Error('Failed to load data');
        }

        const cartData = await cartRes.json();
        const addressesData = await addressesRes.json();

        setCartItems(cartData.items || []);
        setAddresses(addressesData || []);

        if (addressesData.length > 0) {
          setSelectedAddressId(addressesData[0]._id);
        }

        setOrderSummary({
          totalPrice: cartData.total || 0,
          discount: 0,
          finalAmount: cartData.total || 0
        });
} catch (err) {
  console.error('Failed to load checkout data:', err);
  showToast("Failed to load checkout data. Please refresh.", "error");
} finally {
  setLoading(false);
}
    };

    fetchData();
  }, []);

// Inside CheckoutPage.jsx

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const handlePlaceOrder = async () => {
  if (!selectedAddressId) {
    alert("Please select an address");
    return;
  }

  if (paymentMethod === "cod") {
    // Existing COD flow
    await placeCODOrder();
    return;
  }

  // === Razorpay Flow ===
  setPlacingOrder(true);
  try {
    // 1. Create Razorpay order
    const orderRes = await fetch("/api/create-razorpay-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: orderSummary.finalAmount,
      }),
    });

    if (!orderRes.ok) throw new Error("Failed to create payment order");
    const { id: razorpayOrderId, amount, currency } = await orderRes.json();

    // 2. Load Razorpay script
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) throw new Error("Razorpay SDK failed to load");

    // 3. Open Razorpay checkout
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // ← We'll add this next
      amount,
      currency,
      name: "FoodConnects",
      description: "Order Payment",
      order_id: razorpayOrderId,
      handler: async (response) => {
        // 4. Verify payment
        const verifyRes = await fetch("/api/verify-razorpay-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            address: selectedAddressId,
            orderedItems: cartItems.map((item) => ({
              product: item.product._id,
              quantity: item.quantity,
              price: item.product.price,
              unit: item.product.unit || "pcs",
            })),
            totalPrice: orderSummary.totalPrice,
            discount: orderSummary.discount,
            finalAmount: orderSummary.finalAmount,
          }),
        });

if (verifyRes.ok) {
  await fetch("/api/user/cart", { method: "DELETE" });
  const result = await verifyRes.json();
  showToast("Order placed successfully!", "success");
  setTimeout(() => router.push(`/success?orderId=${result.orderId}`), 1500);
} else {
  const errorData = await verifyRes.json();
  showToast(errorData.error || "Payment verification failed. Please try again.", "error");
}
      },
      prefill: {
        name: addresses.find((a) => a._id === selectedAddressId)?.name || "",
        contact: addresses.find((a) => a._id === selectedAddressId)?.phone || "",
      },
      theme: { color: "#3B82F6" },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (err) {
    alert(err.message || "Payment failed. Please try again.");
    console.error(err);
  } finally {
    setPlacingOrder(false);
  }
};

// Keep your existing COD logic in a separate function
const placeCODOrder = async () => {
  setPlacingOrder(true);
  try {
    const res = await fetch("/api/user/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: selectedAddressId,
        paymentMethod: "cod",
        orderedItems: cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
          unit: item.product.unit || "pcs",
        })),
        totalPrice: orderSummary.totalPrice,
        discount: orderSummary.discount,
        finalAmount: orderSummary.finalAmount,
        deliveryDate: new Date().toISOString(),
      }),
    });

    const result = await res.json();

    if (!res.ok || result.error) {
      // Backend sends { error: "..." }
      showToast(result.error || "Failed to place order", "error");
      return;
    }

    await fetch("/api/user/cart", { method: "DELETE" });
    showToast("Order placed successfully!", "success");
    setTimeout(() => router.push(`/success?orderId=${result.orderId}`), 1500);
  } catch (err) {
    showToast("Something went wrong. Please try again.", "error");
    console.error(err);
  } finally {
    setPlacingOrder(false);
  }
};

  if (loading) {
    return <CheckoutSpinner/>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md w-full">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <button
            onClick={() => router.push('/shop')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Checkout</h1>
          <p className="mt-2 text-gray-600">Complete your purchase with confidence</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Section */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Shipping Address</h2>
                {addresses.length > 0 && (
                  <button
                    onClick={() => router.push('/userProfile')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    + Add New Address
                  </button>
                )}
              </div>
              
              {addresses.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-xl">
                  <p className="text-gray-500 mb-4">No saved addresses found</p>
                  <button
                    onClick={() => router.push('/userProfile')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedAddressId === addr._id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 h-5 w-5 rounded-full border-2 ${
                          selectedAddressId === addr._id 
                            ? 'bg-blue-500 border-blue-500 flex items-center justify-center' 
                            : 'border-gray-300 bg-white'
                        }`}>
                          {selectedAddressId === addr._id && (
                            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="flex items-center">
                            <h3 className="text-lg font-semibold text-gray-900">{addr.name}</h3>
                            {addr.isDefault && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-gray-700">{addr.houseNumber}, {addr.street}</p>
                          <p className="text-gray-600">{addr.place}, {addr.state} - {addr.pincode}</p>
                          <p className="mt-2 text-sm font-medium text-gray-900">
                            <svg className="inline-block h-4 w-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {addr.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Payment Section */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
              <div className="space-y-4">
                {[
                  { id: 'cod', label: 'Cash on Delivery', icon: '💵', description: 'Pay when you receive your order' },
                  { id: 'upi', label: 'UPI / Online Payment', icon: '📱', description: 'Pay securely with UPI, cards, or wallets' }
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`block p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      paymentMethod === method.id 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 h-5 w-5 mt-0.5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === method.id 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300 bg-white'
                      }`}>
                        {paymentMethod === method.id && (
                          <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <span className="text-xl mr-3">{method.icon}</span>
                          <span className="block text-sm font-semibold text-gray-900">{method.label}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{method.description}</p>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 -mr-2">
                {cartItems.map((item) => (
                  <div key={item.product._id} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
  {item.product.images && item.product.images.length > 0 ? (
    <img 
      src={item.product.images[0]}  // ✅ Use first image
      alt={item.product.name}
      className="h-full w-full object-cover object-center"
    />
  ) : (
    <div className="h-full w-full flex items-center justify-center text-gray-400">
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  )}
</div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ₹{(item.quantity * item.product.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900 font-medium">₹{orderSummary.totalPrice.toFixed(2)}</span>
                </div>
                {orderSummary.discount > 0 && (
                  <div className="flex justify-between text-base">
                    <span className="text-green-600">Discount</span>
                    <span className="text-green-600 font-medium">- ₹{orderSummary.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">Delivery</span>
                  <span className="text-green-900 font-medium">
                    FREE
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl text-gray-900">₹{orderSummary.finalAmount.toFixed(2)}</span>
                    <span className="text-xs text-gray-500 font-normal">Inclusive of all taxes</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder || cartItems.length === 0 || !selectedAddressId}
                className={`w-full mt-8 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center cursor-pointer ${
                  placingOrder || cartItems.length === 0 || !selectedAddressId
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {placingOrder ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {!selectedAddressId ? 'Select Address First' : 'Place Order'}
                  </>
                )}
              </button>

             
            </div>

            <div className="mt-6 p-6 bg-blue-50 rounded-2xl">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Secure Checkout</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Your payment information is encrypted and secure. We don't store your credit card details.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
            <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}