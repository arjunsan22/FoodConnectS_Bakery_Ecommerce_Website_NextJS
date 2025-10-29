'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Truck, Clock, Package, Check } from 'lucide-react';
import LoadingSpinner from '../../../app/LoadingSpinner';
const statusStages = [
  {
    id: 1,
    title: "Order Confirmed",
    description: "✅ We’ve received your order and it’s now in our system.",
    icon: <CheckCircle className="h-5 w-5" />,
    color: "text-green-500",
  },
  {
    id: 2,
    title: "Processing",
    description: "👩‍🍳 Our bakers are preparing your treats fresh and warm!",
    icon: <Package className="h-5 w-5" />,
    color: "text-blue-500",
  },

];

export default function OrderSuccessPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState(1);
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Simulate status updates
    const statusInterval = setInterval(() => {
      setCurrentStatus(prev => (prev < statusStages.length ? prev + 1 : prev));
    }, 2000);

    return () => clearInterval(statusInterval);
  }, []);

  // ... (keep the existing fetchOrder useEffect and other code)

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6 relative"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0.6 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "loop"
              }}
              className="absolute inset-0 rounded-full bg-green-200"
            />
            <CheckCircle className="h-12 w-12 text-green-600" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gray-900 sm:text-4xl mb-3"
          >
            Order Placed Successfully!
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600"
          >
Your order <span className="font-medium text-blue-600">
  #{orderId.slice(-6)}
</span> has been confirmed
          </motion.p>
          
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '80px' }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mt-4"
          />
        </motion.div>

        {/* Order Status Timeline */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8"
        >
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <Truck className="h-6 w-6 mr-2 text-blue-600" />
              Order Status
            </h2>
            
            <div className="relative">
              <div className="absolute left-6 top-0 h-full w-0.5 bg-gray-200" />
              
              <div className="space-y-8">
                {statusStages.map((stage, index) => (
                  <motion.div
                    key={stage.id}
                    variants={item}
                    className="relative flex items-start group"
                  >
                    <motion.div
                      className={`
                        absolute left-0 h-6 w-6 rounded-full flex items-center justify-center
                        ${currentStatus >= stage.id ? 'bg-blue-100' : 'bg-gray-100'}
                        transition-colors duration-300
                      `}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ 
                          scale: currentStatus >= stage.id ? 1 : 0.8,
                          opacity: currentStatus >= stage.id ? 1 : 0.6
                        }}
                        className={stage.color}
                      >
                        {stage.icon}
                      </motion.div>
                    </motion.div>
                    
                    <div className="ml-12">
                      <motion.h3 
                        className={`
                          text-base font-medium 
                          ${currentStatus >= stage.id ? 'text-gray-900' : 'text-gray-400'}
                          transition-colors duration-300
                        `}
                      >
                        {stage.title}
                      </motion.h3>
                      <motion.p 
                        className={`
                          text-sm 
                          ${currentStatus >= stage.id ? 'text-gray-600' : 'text-gray-400'}
                          transition-colors duration-300
                        `}
                      >
                        {stage.description}
                      </motion.p>
                      
                      {currentStatus === stage.id && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2, ease: "easeInOut" }}
                          className="h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 mt-2"
                        />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons with Animation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/orders"
              className="flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View All Orders
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/shop"
              className="flex items-center justify-center px-6 py-4 border border-gray-200 text-base font-medium rounded-xl shadow-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Continue Shopping
            </Link>
          </motion.div>
        </motion.div>

        {/* Confetti Effect */}
        <AnimatePresence>
          {currentStatus === statusStages.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-50"
            >
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][Math.floor(Math.random() * 5)],
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  initial={{ y: -100, opacity: 0 }}
                  animate={{
                    y: [0, window.innerHeight],
                    x: [0, (Math.random() - 0.5) * 200],
                    opacity: [1, 0],
                    rotate: [0, Math.random() * 360]
                  }}
                  transition={{
                    duration: 2 + Math.random() * 3,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "linear"
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}