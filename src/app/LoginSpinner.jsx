'use client'
import { Check } from "lucide-react";

export default function LoginSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 overflow-hidden relative">
      {/* Ambient background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Outer glow ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-80 h-80 rounded-full bg-gradient-to-r from-amber-300/20 to-orange-300/20 blur-2xl animate-pulse-slow"></div>
        </div>

        {/* Bakery storefront */}
        <div className="relative">
          {/* Storefront shadow */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-400/30 to-orange-400/30 blur-xl rounded-3xl transform scale-110"></div>
          
          {/* Bakery building */}
          <div className="relative w-72 h-80 bg-gradient-to-b from-amber-100 to-amber-200 rounded-t-3xl border-4 border-amber-800 shadow-2xl overflow-hidden">
            
            {/* Roof/Awning */}
            <div className="absolute -top-8 left-0 right-0 h-16 bg-gradient-to-b from-red-600 to-red-700 rounded-t-3xl border-4 border-red-800 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              {/* Awning stripes */}
              <div className="absolute inset-0 flex">
                <div className="flex-1 bg-red-500/30"></div>
                <div className="flex-1"></div>
                <div className="flex-1 bg-red-500/30"></div>
                <div className="flex-1"></div>
                <div className="flex-1 bg-red-500/30"></div>
              </div>
            </div>

            {/* Sign board */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-amber-900 px-6 py-2 rounded-lg border-2 border-amber-950 shadow-lg">
              <div className="text-amber-100 font-bold text-lg tracking-wide">BAKERY</div>
            </div>

            {/* Window display */}
            <div className="absolute top-20 inset-x-8 h-32 bg-gradient-to-br from-sky-200 to-sky-300 rounded-lg border-4 border-amber-900 overflow-hidden shadow-inner">
              {/* Window reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
              
              {/* Baked goods silhouettes */}
              <div className="absolute inset-0 flex items-center justify-around p-4">
                <div className="w-12 h-12 bg-amber-700 rounded-full opacity-60"></div>
                <div className="w-10 h-14 bg-amber-700 rounded-lg opacity-60"></div>
                <div className="w-12 h-12 bg-amber-700 rounded-full opacity-60"></div>
              </div>

              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>

            {/* Door - Opening effect */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-40 perspective-1000">
              {/* Left door */}
              <div className="absolute left-0 w-1/2 h-full bg-gradient-to-r from-amber-800 to-amber-700 border-2 border-amber-950 rounded-tl-lg origin-left animate-door-open-left shadow-xl">
                <div className="absolute top-1/2 right-2 w-2 h-2 bg-yellow-600 rounded-full"></div>
              </div>
              {/* Right door */}
              <div className="absolute right-0 w-1/2 h-full bg-gradient-to-l from-amber-800 to-amber-700 border-2 border-amber-950 rounded-tr-lg origin-right animate-door-open-right shadow-xl">
                <div className="absolute top-1/2 left-2 w-2 h-2 bg-yellow-600 rounded-full"></div>
              </div>
              
              {/* Light from inside */}
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-200 to-transparent opacity-70 animate-glow"></div>
            </div>

            {/* Success checkmark appearing */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 animate-scale-in">
              <div className="relative">
                <div className="absolute inset-0 w-16 h-16 bg-green-400/30 rounded-full animate-ping"></div>
                <div className="relative bg-green-500 rounded-full p-3 shadow-lg">
                  <Check className="w-10 h-10 text-white stroke-[3]" />
                </div>
              </div>
            </div>

            {/* Open sign */}
            <div className="absolute top-24 right-4 animate-swing">
              <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold border-2 border-green-700 shadow-lg">
                OPEN
              </div>
            </div>
          </div>

          {/* Floating bread/pastry particles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 text-4xl animate-float-1">🥐</div>
            <div className="absolute top-1/4 right-1/4 text-3xl animate-float-2">🍞</div>
            <div className="absolute bottom-1/4 left-1/3 text-4xl animate-float-3">🥖</div>
            <div className="absolute bottom-0 right-1/3 text-3xl animate-float-1 delay-500">🥯</div>
          </div>
        </div>

        {/* Text content */}
        <div className="mt-12 text-center max-w-md px-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-red-600 bg-clip-text text-transparent mb-2 animate-pulse-slow">
            Freshly baked smiles waiting just for you.
          </h2>
          <p className="text-amber-900 text-lg font-medium">
Smells good? That’s our loading screen 😄          </p>
          
          {/* Loading dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            <div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce-delay-0"></div>
            <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce-delay-150"></div>
            <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce-delay-300"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes door-open-left {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(-85deg);
          }
        }

        @keyframes door-open-right {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(85deg);
          }
        }

        @keyframes scale-in {
          0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2) rotate(180deg);
          }
          100% {
            transform: translate(-50%, -50%) scale(1) rotate(360deg);
            opacity: 1;
          }
        }

        @keyframes glow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.9;
          }
        }

        @keyframes swing {
          0%, 100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
        }

        @keyframes float-1 {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(20px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes float-2 {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-120px) translateX(-30px) rotate(-360deg);
            opacity: 0;
          }
        }

        @keyframes float-3 {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-90px) translateX(25px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-door-open-left {
          animation: door-open-left 1.5s ease-out forwards;
        }

        .animate-door-open-right {
          animation: door-open-right 1.5s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 1s ease-out 1s forwards;
          opacity: 0;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .animate-swing {
          animation: swing 2s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-float-1 {
          animation: float-1 4s ease-in-out infinite;
        }

        .animate-float-2 {
          animation: float-2 5s ease-in-out infinite;
        }

        .animate-float-3 {
          animation: float-3 4.5s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-bounce-delay-0 {
          animation: bounce 1s ease-in-out infinite;
        }

        .animate-bounce-delay-150 {
          animation: bounce 1s ease-in-out 0.15s infinite;
        }

        .animate-bounce-delay-300 {
          animation: bounce 1s ease-in-out 0.3s infinite;
        }

        .delay-500 {
          animation-delay: 500ms;
        }

        .delay-700 {
          animation-delay: 700ms;
        }

        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}