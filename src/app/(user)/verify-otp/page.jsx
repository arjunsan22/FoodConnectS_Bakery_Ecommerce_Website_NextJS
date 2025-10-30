// app/(user)/verify-otp/page.jsx
import { Suspense } from 'react';
import LoadingSpinner from '../../../app/LoadingSpinner';
import VerifyOTPForm from './VerifyOTPForm';

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <VerifyOTPForm />
    </Suspense>
  );
}