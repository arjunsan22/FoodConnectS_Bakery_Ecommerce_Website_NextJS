'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';
import LoadingSpinner from '../../../app/LoadingSpinner';

const statusIcons = {
  pending: <Clock className="w-4 h-4" />,
  processing: <Package className="w-4 h-4" />,
  shipped: <Truck className="w-4 h-4" />,
  delivered: <CheckCircle2 className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />,
  'return request': <ArrowRight className="w-4 h-4" />,
  returned: <ArrowRight className="w-4 h-4" />
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  'return request': 'bg-purple-100 text-purple-800',
  returned: 'bg-gray-100 text-gray-800'
};

const ITEMS_PER_PAGE = 5;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/user/orders', { credentials: 'include' });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to load orders');
        }
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error('Error:', err);
        if (err.message === 'Unauthorized') {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedOrders = useMemo(() => {
    const sortableItems = [...orders];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [orders, sortConfig]);

  const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 py-12"
      >
        <div className="text-center bg-white p-12 rounded-2xl shadow-lg border border-gray-100">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-50 mb-6">
            <Package className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">No Orders Yet</h1>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You haven't placed any orders yet. Start shopping to see your orders here!
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Start Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900 mb-8"
      >
        My Orders
      </motion.h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 text-sm font-medium text-gray-500 uppercase tracking-wider">
          <div 
            className="col-span-2 flex items-center cursor-pointer hover:text-gray-700"
            onClick={() => handleSort('orderId')}
          >
            Order ID
            {sortConfig.key === 'orderId' && (
              <span className="ml-1">
                {sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              </span>
            )}
          </div>
          <div 
            className="col-span-2 flex items-center cursor-pointer hover:text-gray-700"
            onClick={() => handleSort('createdAt')}
          >
            Date
            {sortConfig.key === 'createdAt' && (
              <span className="ml-1">
                {sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              </span>
            )}
          </div>
          <div className="col-span-3">Items</div>
          <div className="col-span-2">Total Amount</div>
          <div 
            className="col-span-2 flex items-center cursor-pointer hover:text-gray-700"
            onClick={() => handleSort('status')}
          >
            Status
            {sortConfig.key === 'status' && (
              <span className="ml-1">
                {sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              </span>
            )}
          </div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {/* Orders List */}
        <AnimatePresence>
          {paginatedOrders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-100 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6">
                {/* Mobile Order Header */}
                <div className="md:hidden flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">Order #{order.orderId}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Desktop Order ID */}
                <div className="hidden md:flex md:col-span-2 items-center">
                  <span className="text-sm font-medium text-gray-900">#{order.orderId.slice(-6)}</span>
                </div>

                {/* Date - Hidden on mobile as it's shown in the header */}
                <div className="hidden md:flex md:col-span-2 items-center">
                  <span className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Items */}
                <div className="md:col-span-3">
                  <div className="flex -space-x-2">
                    {order.orderedItems.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="relative group">
                        {item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        {order.orderedItems.length > 4 && idx === 3 && (
                          <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white text-xs font-medium">
                            +{order.orderedItems.length - 4}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Amount */}
                <div className="md:col-span-2 flex items-center">
                  <span className="text-sm font-medium text-gray-900">
                    ₹{order.finalAmount?.toFixed(2)}
                  </span>
                </div>

                {/* Status - Hidden on mobile as it's shown in the header */}
                <div className="hidden md:flex md:col-span-2 items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusIcons[order.status] || statusIcons.pending}
                    <span className="ml-1.5">{order.status.replace('_', ' ')}</span>
                  </span>
                </div>

                {/* Action */}
                <div className="md:col-span-1 flex justify-end items-center">
                  <Link
                    href={`/orders/${order.orderId}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                  >
                    View
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * ITEMS_PER_PAGE, sortedOrders.length)}
              </span>{' '}
              of <span className="font-medium">{sortedOrders.length}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg border ${currentPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 rounded-lg border ${currentPage === pageNum 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-lg border ${currentPage === totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
      
    </div>
    
  );
}