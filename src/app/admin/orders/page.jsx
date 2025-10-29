'use client';

import { useState, useEffect } from 'react';
import Toast from '../../components/Toast';

const STATUS_FLOW = [
  'pending',
  'processing',
  'shipping',
  'delivered',
  'cancelled',
  'returned',
  'payment_pending',
];

const STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  shipping: 'Shipping',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
  payment_pending: 'Payment Pending',
};

const STATUS_COLORS = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipping: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  returned: 'bg-purple-50 text-purple-700 border-purple-200',
  payment_pending: 'bg-orange-50 text-orange-700 border-orange-200',
};

const STATUS_ICONS = {
  pending: '⏳',
  processing: '⚙️',
  shipping: '🚚',
  delivered: '✅',
  cancelled: '❌',
  returned: '↩️',
  payment_pending: '💳',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      showToast('Status updated successfully!', 'success');
      fetchOrders();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-white rounded-2xl shadow-sm"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-48 bg-white rounded-2xl shadow-sm"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Orders Management</h1>
          <p className="text-gray-600">Manage and track all customer orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{orderStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">
                📦
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{orderStats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-2xl">
                ⏳
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Processing</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{orderStats.processing}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">
                ⚙️
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Delivered</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{orderStats.delivered}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 border border-gray-100 animate-slide-up">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                filterStatus === 'all'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Orders
            </button>
            {STATUS_FLOW.map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                  filterStatus === status
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{STATUS_ICONS[status]}</span>
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg">No orders found.</p>
            </div>
          ) : (
            filteredOrders.map((order, index) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {order.orderId?.slice(-3) || '#'}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Order ID</p>
                        <p className="font-mono text-gray-900 font-semibold">{order.orderId}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(order.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-500 font-medium">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{order.finalAmount?.toFixed(2) || order.totalPrice}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 flex items-center gap-2 ${STATUS_COLORS[order.status]}`}
                      >
                        <span className="text-lg">{STATUS_ICONS[order.status]}</span>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {order.userId?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{order.userId?.name || '—'}</p>
                          <p className="text-sm text-gray-600">{order.userId?.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedAddress(order.address)}
                        className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-orange-500 hover:text-orange-600 transition-all duration-200 flex items-center gap-2"
                      >
                        📍 View Address
                      </button>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="mb-4">
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors mb-2"
                    >
                      <span>{expandedOrder === order._id ? '▼' : '▶'}</span>
                      Items ({order.orderedItems.length})
                    </button>
                    
                    {expandedOrder === order._id && (
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 space-y-2 animate-expand">
                        {order.orderedItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-lg p-3 flex justify-between items-center shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">
                                {item.quantity}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{item.product?.name}</p>
                                <p className="text-xs text-gray-500">{item.unit}</p>
                              </div>
                            </div>
                            <p className="font-bold text-gray-900">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Status Controls */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Change Status</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_FLOW.filter((s) => s !== order.status).map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(order.orderId, status)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-200 hover:scale-105 flex items-center gap-2 ${
                            STATUS_COLORS[status]
                          } hover:shadow-md`}
                        >
                          <span>{STATUS_ICONS[status]}</span>
                          {STATUS_LABELS[status]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Address Modal */}
      {selectedAddress && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedAddress(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                📍 Delivery Address
              </h3>
              <button
                onClick={() => setSelectedAddress(null)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                <p className="font-semibold text-gray-900 text-lg mb-1">{selectedAddress.name}</p>
                <p className="text-gray-700">
                  {selectedAddress.houseNo}, {selectedAddress.streetMark}
                </p>
                <p className="text-gray-700">
                  {selectedAddress.place}, {selectedAddress.state} - {selectedAddress.pincode}
                </p>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-orange-200">
                  <span className="text-orange-600">📞</span>
                  <p className="font-semibold text-gray-900">{selectedAddress.phone}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedAddress(null)}
              className="mt-4 w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {toast.show && <Toast message={toast.message} type={toast.type} />}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes expand {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-expand {
          animation: expand 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}