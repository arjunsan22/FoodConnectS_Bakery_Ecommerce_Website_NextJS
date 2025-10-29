import React from 'react';

export default function  BakeryShopLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-200 to-sky-50">
      <div className="relative">
        {/* Loading text */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-amber-900 mb-2">Building Your Bakery...</h2>
          <div className="flex justify-center gap-1">
            <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>

        {/* Shop container */}
        <div className="relative w-72 h-96">
          {/* Foundation - appears first */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-amber-900 to-amber-950 animate-slideUp" style={{ animationDelay: '0s' }}></div>
          
          {/* Base floor - appears second */}
          <div className="absolute bottom-4 left-0 right-0 h-16 bg-gradient-to-b from-amber-100 to-amber-200 border-4 border-amber-800 animate-slideUp" style={{ animationDelay: '0.3s' }}></div>
          
          {/* Main shop body */}
          <div className="absolute bottom-20 left-0 right-0 h-56 bg-gradient-to-b from-amber-50 to-amber-100 border-4 border-amber-800 animate-slideUp overflow-hidden" style={{ animationDelay: '0.6s' }}>
            
            {/* Window on left */}
            <div className="absolute top-12 left-4 w-20 h-24 bg-gradient-to-b from-cyan-200 to-cyan-300 border-4 border-amber-700 animate-fadeIn" style={{ animationDelay: '1.2s' }}>
              <div className="absolute top-0 left-1/2 w-0.5 h-full bg-amber-700 transform -translate-x-1/2"></div>
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-amber-700 transform -translate-y-1/2"></div>
            </div>

            {/* Door in center */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-32 bg-gradient-to-b from-amber-600 to-amber-700 border-4 border-amber-800 animate-fadeIn" style={{ animationDelay: '1.4s' }}>
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-cyan-200 border-2 border-amber-700 rounded-sm"></div>
              <div className="absolute bottom-8 right-2 w-2 h-2 bg-amber-900 rounded-full"></div>
            </div>

            {/* Window on right */}
            <div className="absolute top-12 right-4 w-24 h-28 bg-gradient-to-b from-cyan-200 to-cyan-300 border-4 border-amber-700 animate-fadeIn" style={{ animationDelay: '1.6s' }}>
              <div className="absolute top-0 left-1/2 w-0.5 h-full bg-amber-700 transform -translate-x-1/2"></div>
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-amber-700 transform -translate-y-1/2"></div>
              {/* Plant in window */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="w-12 h-8 bg-green-600 rounded-t-full opacity-70"></div>
                <div className="w-8 h-6 bg-green-700 rounded-t-full absolute bottom-0 left-2 opacity-60"></div>
              </div>
            </div>

            {/* Decorative pretzel sign */}
            <div className="absolute top-4 left-8 w-8 h-8 border-4 border-amber-700 rounded-full animate-spin" style={{ animationDelay: '1.8s', animationDuration: '3s' }}>
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-amber-700 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>

          {/* Awning frame - appears after body */}
          <div className="absolute bottom-72 left-0 right-0 h-8 bg-gradient-to-b from-amber-800 to-amber-900 animate-slideUp" style={{ animationDelay: '0.9s' }}></div>

          {/* Striped awning - appears last */}
          <div className="absolute bottom-64 left-0 right-0 h-16 animate-slideUp overflow-hidden" style={{ animationDelay: '1.0s' }}>
            <div className="flex h-full">
              <div className="flex-1 bg-gradient-to-b from-red-700 to-red-800"></div>
              <div className="flex-1 bg-gradient-to-b from-amber-200 to-amber-300"></div>
              <div className="flex-1 bg-gradient-to-b from-red-700 to-red-800"></div>
              <div className="flex-1 bg-gradient-to-b from-amber-200 to-amber-300"></div>
              <div className="flex-1 bg-gradient-to-b from-red-700 to-red-800"></div>
              <div className="flex-1 bg-gradient-to-b from-amber-200 to-amber-300"></div>
              <div className="flex-1 bg-gradient-to-b from-red-700 to-red-800"></div>
            </div>
            {/* Awning shadow */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-b from-black/20 to-transparent"></div>
          </div>

          {/* Sign - appears after awning */}
          <div className="absolute bottom-80 left-1/2 transform -translate-x-1/2 bg-amber-500 px-4 py-2 border-4 border-amber-800 animate-fadeIn" style={{ animationDelay: '1.5s' }}>
            <span className="text-amber-900 font-bold text-lg">Bakery Shop</span>
          </div>

          {/* Decorative plant */}
          <div className="absolute bottom-20 left-2 animate-fadeIn" style={{ animationDelay: '2s' }}>
            <div className="w-12 h-16 relative">
              <div className="absolute bottom-0 left-1/2 w-1 h-12 bg-green-800 transform -translate-x-1/2"></div>
              <div className="absolute top-0 left-0 w-6 h-8 border-2 border-green-700 rounded-full transform rotate-45 bg-green-600"></div>
              <div className="absolute top-2 right-0 w-6 h-8 border-2 border-green-700 rounded-full transform -rotate-45 bg-green-600"></div>
            </div>
          </div>

          {/* Arrow sign pointing to shop */}
          <div className="absolute bottom-32 left-2 animate-fadeIn" style={{ animationDelay: '2.2s' }}>
            <div className="relative">
              <div className="w-1 h-16 bg-amber-800 ml-3"></div>
              <div className="bg-amber-400 border-2 border-amber-800 px-2 py-1 relative">
                <span className="text-xs text-amber-900 font-bold">←</span>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-slideUp {
            animation: slideUp 0.5s ease-out forwards;
            opacity: 0;
          }

          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
            opacity: 0;
          }
        `}</style>
      </div>
    </div>
  );
};

