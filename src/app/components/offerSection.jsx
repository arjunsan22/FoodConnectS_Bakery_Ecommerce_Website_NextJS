// app/components/offerSection.jsx
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const dummyOffers = [
  {
    id: 1,
    title: "Summer Sale",
    description: "Up to 50% off on seasonal drinks",
    discount: "50% OFF",
    validUntil: "Valid until dec 31",
    color: "from-orange-400 to-red-500",
    icon: "🍉",
  },
  {
    id: 2,
    title: "New User Deal",
    description: "Extra 20% off on first order",
    discount: "20% EXTRA",
    validUntil: "New customers only",
    color: "from-purple-500 to-indigo-600",
    icon: "🎁",
  },
  {
    id: 3,
    title: "Weekend Special",
    description: "Buy 1 Get 1 Free on biscuits",
    discount: "BOGO",
    validUntil: "Fri-Sun only",
    color: "from-green-400 to-emerald-500",
    icon: "🥬",
  },
  {
    id: 4,
    title: "Festival Offer",
    description: "Flat ₹100 off on orders above ₹1000",
    discount: "₹100 OFF",
    validUntil: "Diwali Special",
    color: "from-yellow-400 to-amber-500",
    icon: "✨",
  },
];

export default function OfferSection() {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Exclusive <span className="text-orange-500">Offers</span>
          </h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
        </motion.div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {dummyOffers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              onHoverStart={() => setHoveredCard(offer.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className="relative group"
            >
              {/* Animated background */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${offer.color} rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300`}></div>
              
              {/* Card */}
              <div className="relative bg-white rounded-2xl p-6 shadow-lg h-full border border-gray-100 overflow-hidden">
                {/* Animated top bar */}
                <motion.div 
                  className={`h-2 w-full bg-gradient-to-r ${offer.color} rounded-t-2xl`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: hoveredCard === offer.id ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Content */}
                <div className="pt-2">
                  <div className="text-3xl mb-3">{offer.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{offer.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{offer.description}</p>
                  
                  {/* Discount badge */}
                  <motion.div 
                    className={`inline-block px-3 py-1 rounded-full text-white font-bold text-sm mb-3 bg-gradient-to-r ${offer.color}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {offer.discount}
                  </motion.div>
                  
                  <p className="text-xs text-gray-500">{offer.validUntil}</p>
                </div>
                
                {/* Floating particles (subtle animation) */}
                <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-orange-100 opacity-20 animate-pulse"></div>
                <div className="absolute -top-2 -left-2 w-10 h-10 rounded-full bg-purple-100 opacity-20 animate-bounce"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          
        </motion.div>
      </div>
    </section>
  );
}