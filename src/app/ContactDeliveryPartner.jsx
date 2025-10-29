'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PhoneCall } from 'lucide-react'

export default function ContactDeliveryPartner() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-4 relative flex flex-col items-start">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-md transition-transform duration-200 hover:scale-105 cursor-pointer"
      >
        <PhoneCall size={16} />
        {open ? 'Hide Partner Info' : 'Contact Delivery Partner'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="contact-info"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mt-3 w-full sm:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4"
          >
            <p className="text-gray-900 dark:text-white font-semibold text-base">
              Name: <span className="text-green-600">Henry</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-1 flex items-center gap-1">
              📞 <span>8519161542</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
