// src/components/Hero.jsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Banner from './Banner';

export default function Hero() {
  return (
    <section className="relative h-[70vh] md:h-screen overflow-hidden">
      {/* Background Image */}
     <Banner/>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 flex flex-col justify-center h-full text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-lg"
        >
  <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="text-sm md:text-lg font-medium tracking-[0.25em] 
                 bg-gradient-to-r from-rose-500 via-orange-400 to-pink-500 
                 text-transparent bg-clip-text drop-shadow-md mb-2"
    >
      FoodConnects
    </motion.p>
              <motion.h1
      className="text-4xl md:text-6xl font-bold leading-tight mb-6 
                 bg-gradient-to-r from-rose-500 via-orange-400 to-pink-500 
                 text-transparent bg-clip-text drop-shadow-lg 
                 tracking-[0.05em] uppercase"
      initial={{ backgroundPosition: "0% 50%" }}
      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
      transition={{
        duration: 5,
        ease: "linear",
        repeat: Infinity,
      }}
      style={{
        backgroundSize: "200% auto", // allows smooth gradient movement
      }}
    >
      Premium Cakes, <br /> Taste Variety of Pastries
    </motion.h1>
          <div className="flex gap-4">
            <Link
              href="/cakes"
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-md font-medium transition"
            >
              Shop Now
            </Link>
           
          </div>
        </motion.div>
      </div>
    </section>
  );
}