'use client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Swal from 'sweetalert2';
import ContactDeliveryPartner from '../../../../app/ContactDeliveryPartner'

// Helper to safely format status
const formatStatus = (status) => {
  if (!status) return 'Pending';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function OrderDetailsPage() {
  const params = useParams();
  const { orderId } = params || {};

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/user/orders/${orderId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load order');
        }
        const orderData = await res.json();
        setOrder(orderData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleCancelItem = async (itemId, productName) => {
    const result = await Swal.fire({
      title: 'Cancel Item?',
      html: `Are you sure you want to cancel <br/><strong>"${productName}"</strong>?<br/>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, cancel it',
      cancelButtonText: 'No, keep it',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-lg px-6 py-2.5',
        cancelButton: 'rounded-lg px-6 py-2.5'
      }
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: 'Processing...',
      text: 'Please wait',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const res = await fetch(`/api/user/orders/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        Swal.fire({
          icon: 'error',
          title: 'Cancellation Failed',
          text: data.error || 'Unable to cancel the item',
          confirmButtonColor: '#3b82f6',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-lg px-6 py-2.5'
          }
        });
        return;
      }

      const apiResult = await res.json();
      setOrder(apiResult.updatedOrder);
      
      Swal.fire({
        icon: 'success',
        title: 'Cancelled Successfully',
        text: apiResult.message,
        confirmButtonColor: '#10b981',
        timer: 3000,
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-lg px-6 py-2.5'
        }
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'An unexpected error occurred.',
        confirmButtonColor: '#3b82f6',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-lg px-6 py-2.5'
        }
      });
    }
  };

  const canCancelItem = (item) => {
    if (!order) return false;
    const orderTime = new Date(order.createdAt).getTime();
    const now = Date.now();
    const minutesElapsed = (now - orderTime) / (60 * 1000);
    return (
      minutesElapsed <= 15 &&
      item.status !== 'cancelled' &&
      !['delivered', 'cancelled'].includes(order.status)
    );
  };


const handleDownloadInvoice = async () => {
  // Create a hidden div with invoice content (only non-cancelled items)
  const invoiceContent = document.createElement('div');
  invoiceContent.id = 'invoice-content';
  invoiceContent.style.padding = '20px';
  invoiceContent.style.width = '800px';
  invoiceContent.style.fontFamily = 'Arial, sans-serif';
  invoiceContent.style.fontSize = '14px';
  invoiceContent.style.color = '#333';

  // Filter out cancelled items
  const validItems = order.orderedItems.filter(item => item.status !== 'cancelled');

  // Build HTML content
  invoiceContent.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="font-size: 24px; font-weight: bold; color: #1e40af;">INVOICE</h2>
      <p style="font-size: 16px; color: #6b7280;">Order #${order.orderId}</p>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px;">
      <div>
        <h3 style="font-weight: bold; margin-bottom: 5px;">From:</h3>
        <p>FoodConnects</p>
        <p>Ettumannor,kottayam</p>
        <p>Kerala</p>
        <p>arjunsandhya4@gmail.com</p>
      </div>
      <div>
        <h3 style="font-weight: bold; margin-bottom: 5px;">Bill To:</h3>
        <p>${order.address?.name || 'N/A'}</p>
        <p>${order.address?.houseNo}, ${order.address?.streetMark}</p>
        <p>${order.address?.place}, ${order.address?.state} - ${order.address?.pincode}</p>
        <p>Phone: ${order.address?.phone || 'N/A'}</p>
      </div>
    </div>

    <div style="margin: 20px 0; font-size: 13px; color: #6b7280;">
      <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString('en-IN')}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background-color: #f3f4f6;">
          <th style="border: 1px solid #d1d5db; padding: 10px; text-align: left;">Item</th>
          <th style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">Qty</th>
          <th style="border: 1px solid #d1d5db; padding: 10px; text-align: right;">Price</th>
          <th style="border: 1px solid #d1d5db; padding: 10px; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${validItems.map(item => `
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 10px;">${item.product?.name || 'Unknown'}</td>
            <td style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">${item.quantity} ${item.unit}</td>
            <td style="border: 1px solid #d1d5db; padding: 10px; text-align: right;">₹${item.price?.toFixed(2) || '0.00'}</td>
            <td style="border: 1px solid #d1d5db; padding: 10px; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="border: 1px solid #d1d5db; padding: 10px; text-align: right; font-weight: bold;">Total Amount:</td>
          <td style="border: 1px solid #d1d5db; padding: 10px; text-align: right; font-weight: bold;">₹${order.finalAmount?.toFixed(2) || '0.00'}</td>
        </tr>
      </tfoot>
    </table>

    <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #9ca3af;">
      <p>Thank you for your order!</p>
      <p>This is a computer-generated invoice. No signature required.</p>
    </div>
  `;

  document.body.appendChild(invoiceContent);

  try {
    const canvas = await html2canvas(invoiceContent, {
      scale: 2, // Higher quality
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`invoice_${order.orderId}.pdf`);
  } catch (err) {
    console.error('PDF generation failed:', err);
    Swal.fire({
      icon: 'error',
      title: 'Download Failed',
      text: 'Unable to generate invoice. Please try again.',
      confirmButtonColor: '#3b82f6',
    });
  } finally {
    // Clean up
    document.body.removeChild(invoiceContent);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl w-1/3"></div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center max-w-md w-full animate-[slideUp_0.5s_ease-out]">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Unable to Load Order</h2>
          <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
          <Link href="/user/orders" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all hover:scale-105">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center max-w-md w-full animate-[slideUp_0.5s_ease-out]">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">We couldn't find the order you're looking for.</p>
          <Link href="/user/orders" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all hover:scale-105">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slideDown">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1">
              Order Details
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Order ID:</span>
              <code className="px-3 py-1 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-mono border border-gray-200 dark:border-gray-700">
                {order.orderId}
              </code>
            </div>
          </div>
          <Link 
            href="/orders" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all hover:scale-105 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            All Orders
          </Link>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 animate-slideUp hover:shadow-2xl transition-shadow">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Order Placed
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(order.createdAt).toLocaleTimeString('en-IN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Order Status
              </div>
              <div className="inline-flex items-center gap-2">
                <span className={`relative flex h-3 w-3 ${
                  order.status === 'delivered' ? '' : 'animate-pulse'
                }`}>
                  <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    order.status === 'cancelled' ? 'bg-red-400' :
                    order.status === 'delivered' ? 'bg-green-400' : 'bg-yellow-400'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${
                    order.status === 'cancelled' ? 'bg-red-500' :
                    order.status === 'delivered' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></span>
                </span>
                <span className={`font-bold text-lg ${
                  order.status === 'cancelled' ? 'text-red-600 dark:text-red-400' :
                  order.status === 'delivered' ? 'text-green-600 dark:text-green-400' :
                  'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {formatStatus(order.status)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payment Method
              </div>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">
                {order.paymentMethod}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Total Amount
              </div>
              <p className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                ₹{order.finalAmount?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.address && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 animate-fadeIn hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shipping Address</h2>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 space-y-2">
              <p className="font-semibold text-gray-900 dark:text-white text-lg">{order.address.name}</p>
              <p className="text-gray-700 dark:text-gray-300">{order.address.houseNo}, {order.address.streetMark}</p>
              <p className="text-gray-700 dark:text-gray-300">{order.address.place}, {order.address.state}</p>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-600 dark:text-gray-400">PIN:</span>
                  <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded-md font-mono text-gray-900 dark:text-white">
                    {order.address.pincode}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Phone:</span>
                  <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded-md font-mono text-gray-900 dark:text-white">
                    {order.address.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ordered Items */}
        <div className="animate-fadeIn">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order Items ({order.orderedItems?.length || 0})
            </h2>
          </div>
          
          <div className="space-y-4">
            {order.orderedItems?.map((item, index) => (
              <div
                key={item._id || item.product}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-5 hover:shadow-xl transition-all animate-scaleIn group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Image */}
      <Link href={`/products/${item.product._id}`}>
                  <div className="flex-shrink-0">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 group-hover:scale-105 transition-transform">
                      {item.product?.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name || 'Product'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
</Link>
                  {/* Info */}
                  <div className="flex-grow space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                        {item.product?.name || 'Unknown Product'}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          ₹{item.price?.toFixed(2) || '0.00'}
                        </span>
                        <span>×</span>
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md text-sm font-medium">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full ${
                          item.status === 'cancelled'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            : item.status === 'delivered'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                        }`}
                      >
                        {item.status === 'cancelled' && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                        {item.status === 'delivered' && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {item.status !== 'cancelled' && item.status !== 'delivered' && (
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        )}
                        {formatStatus(item.status)}
                      </span>
                    </div>

                    {/* Cancellation Reason */}
                    {item.cancellationReason && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-red-800 dark:text-red-300">Cancellation Reason:</p>
                          <p className="text-sm text-red-700 dark:text-red-400">{item.cancellationReason}</p>
<p className="text-sm text-amber-700 dark:text-amber-400">
 💸 Refund will be credited to your bank account within 24 hours</p>
                          {/*  Refund will be credited to your bank account within 1–2 business days. */}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Area */}
                  <div className="flex flex-col items-end justify-between gap-3 sm:min-w-[140px]">
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Subtotal</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </p>
                    </div>

                    {item.status === 'cancelled' ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-medium text-green-700 dark:text-green-300">
                          Refund Processing
                        </span>
                      </div>
                    ) : canCancelItem(item) ? (
                      <>
                      <button
                        onClick={() =>
                          handleCancelItem(item._id, item.product?.name || 'this item')
                        }
                        className="group/btn relative px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium transition-all hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel Item
                      </button>
                      <p className="text-[11px] text-gray-500 mt-1 ml-1">
                      ⏰ Cancellation available only within 15 minutes of order placement.
                    </p>
                  </>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
{order.status !== "cancelled" && order.status !== "delivered" && (
  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800 mb-6 animate-fade-in-up">
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-2xl">🛵</span>
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          Your order is on the way! 🎉
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Estimated delivery in{" "}
          <span className="font-semibold text-green-600 dark:text-green-400">
            25-35 minutes
          </span>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Our delivery partner will reach your doorstep soon
        </p>

        {/* Dropdown button */}
        <ContactDeliveryPartner />
      </div>
    </div>
  </div>
)}
        {/* Order Summary Footer */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 border border-blue-100 dark:border-gray-700 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Need help with your order?</p>
                <p className="font-semibold text-gray-900 dark:text-white">Contact customer support</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Order Total</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                ₹{order.finalAmount?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>
{order.status === 'delivered' && (
  <div className="text-center mt-6">
    <button
      onClick={handleDownloadInvoice}
      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 mx-auto cursor-pointer"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Download Invoice
    </button>
  </div>
)}
      </div>
    </div>
  );
}