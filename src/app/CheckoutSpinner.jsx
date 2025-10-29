import { Check } from "lucide-react";

export default function CheckoutSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 overflow-hidden relative">
      {/* Ambient background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Outer glow ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-2xl animate-spin-slow"></div>
        </div>

        {/* Rotating ring */}
        <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
          <div className="w-56 h-56 rounded-full border-4 border-transparent border-t-purple-400 border-r-blue-400"></div>
        </div>

        {/* Phone device */}
        <div className="relative">
          {/* Phone shadow/glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/50 to-blue-500/50 blur-xl rounded-[2.5rem] transform scale-110"></div>
          
          {/* Phone body */}
          <div className="relative w-32 h-52 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] border-2 border-slate-700 shadow-2xl overflow-hidden">
            {/* Screen */}
            <div className="absolute inset-3 rounded-[1.8rem] bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 overflow-hidden">
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shimmer"></div>
              
              {/* Success icon container */}
              <div className="relative h-full flex flex-col items-center justify-center">
                {/* Icon background pulse */}
                <div className="absolute w-20 h-20 bg-white/20 rounded-full animate-ping"></div>
                <div className="absolute w-16 h-16 bg-white/30 rounded-full animate-pulse"></div>
                
                {/* Check icon */}
                <div className="relative bg-white rounded-full p-3 shadow-lg animate-bounce-gentle">
                  <Check className="w-8 h-8 text-purple-600 stroke-[3]" />
                </div>
              </div>
            </div>

            {/* Phone notch */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-slate-950 rounded-full"></div>
            
            {/* Phone button */}
            <div className="absolute right-0 top-20 w-0.5 h-8 bg-slate-700 rounded-l"></div>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-float-1"></div>
            <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-float-2"></div>
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-indigo-400 rounded-full animate-float-3"></div>
            <div className="absolute bottom-0 right-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full animate-float-1 delay-500"></div>
          </div>
        </div>

        {/* Text content */}
        <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2 animate-pulse-slow">
            Finalizing your purchase
          </h2>
          <p className="text-slate-400 text-sm">Mixing love and flour — just a moment!</p>
          
          {/* Loading dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce-delay-0"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce-delay-150"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce-delay-300"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
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

        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.05);
          }
        }

        @keyframes float-1 {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(20px);
          }
        }

        @keyframes float-2 {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-120px) translateX(-30px);
          }
        }

        @keyframes float-3 {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-90px) translateX(25px);
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

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
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
      `}</style>
    </div>
  );
}