// src/app/(user)/success/OrderSuccessContent.jsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Truck, Clock, Package } from 'lucide-react';
import Link from 'next/link';

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

export default function OrderSuccessContent() {
  const [currentStatus, setCurrentStatus] = useState(1);
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const statusInterval = setInterval(() => {
      setCurrentStatus(prev => (prev < statusStages.length ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(statusInterval);
  }, []);

  // Handle case where orderId is missing
  if (!orderId) {
    return <div className="text-center py-10">Invalid order link.</div>;
  }

  return (
    <>
      {/* Your entire UI from the original component goes here */}
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
          Your order <span className="font-medium text-blue-600">#{orderId.slice(-6)}</span> has been confirmed
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
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <Truck className="h-6 w-6 mr-2 text-blue-600" />
            Order Status
          </h2>
          
          <div className="relative">
            <div className="absolute left-6 top-0 h-full w-0.5 bg-gray-200" />
            <div className="space-y-8">
              {statusStages.map((stage) => (
                <motion.div
                  key={stage.id}
                  className="relative flex items-start group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * stage.id }}
                >
                  <div
                    className={`absolute left-0 h-6 w-6 rounded-full flex items-center justify-center ${currentStatus >= stage.id ? 'bg-blue-100' : 'bg-gray-100'}`}
                  >
                    <div className={stage.color}>
                      {stage.icon}
                    </div>
                  </div>
                  <div className="ml-12">
                    <h3 className={currentStatus >= stage.id ? 'text-gray-900' : 'text-gray-400'}>
                      {stage.title}
                    </h3>
                    <p className={currentStatus >= stage.id ? 'text-gray-600' : 'text-gray-400'}>
                      {stage.description}
                    </p>
                    {currentStatus === stage.id && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2 }}
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

      {/* Action Buttons */}
      <motion.div 
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/orders"
            className="flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
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
            className="flex items-center justify-center px-6 py-4 border border-gray-200 text-base font-medium rounded-xl shadow-lg text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Continue Shopping
          </Link>
        </motion.div>
      </motion.div>

      {/* Confetti */}
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
                  ease: "linear"
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}