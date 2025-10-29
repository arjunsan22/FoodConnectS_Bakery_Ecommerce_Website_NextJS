import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function LoadingSpinner() {
    return (    
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="relative w-12 h-12 mb-4">
        <ShoppingCartIcon className="h-12 w-12 text-blue-500 animate-bounce" />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span>🔥</span>
        </div>
      </div>
     
    </div>
    );
}