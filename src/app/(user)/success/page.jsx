// src/app/(user)/success/page.jsx
import { Suspense } from 'react';
import LoadingSpinner from '../../../app/LoadingSpinner';
import OrderSuccessContent from './OrderSuccessContent';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Suspense fallback={<LoadingSpinner />}>
          <OrderSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}