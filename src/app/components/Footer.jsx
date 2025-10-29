// components/Footer.tsx
"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';

const footerLinks = {
  Shop: ['Cakes', 'Breads', 'Cookies', 'Seasonal Specials'],
  Support: ['Contact', 'FAQs', 'Delivery Info', 'Returns'],
  Company: ['About', 'Careers', 'Blog', 'Sustainability'],
};

const socialIcons = ['Facebook', 'Instagram', 'Twitter', 'Pinterest'];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 style={{ fontFamily: '"Playwrite DE SAS", cursive' }} className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent mb-4">
              FoodConnects
            </h2>
            <p  className="text-gray-400 max-w-xs">
              Freshly baked with love, delivered to your doorstep. Taste the joy in every bite!
            </p>
          </motion.div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([title, links], idx) => (
            <motion.div
              key={title} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (idx + 1) }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href={`/${link.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-gray-400 hover:text-amber-400 transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} FoodConnects. All rights reserved.
          </p>
           {/* Modern “Created by” section */}
  <p className="text-sm text-gray-400">
   Code & design by {" "}
    <motion.span
      whileHover={{ color: "#fbbf24", scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="font-semibold text-gray-300 cursor-pointer"
    >
      Arjun Sandhya
    </motion.span>
  </p>
          <div className="flex space-x-4">
            {socialIcons.map((social) => (
              <motion.a
                key={social}
                href="#"
                whileHover={{ y: -3 }}
                className="text-gray-400 hover:text-amber-400 transition-colors"
              >
                {social}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}