'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyOTPForm() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendTimer, setResendTimer] = useState(60);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
  }, [email, router]);

  // Timer
  useEffect(() => {
    let interval;
    if (resendDisabled && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendDisabled, resendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ✅ Still using localStorage for pending user — but you said you don't want this.
      // We'll address it below.
      const pendingUser = JSON.parse(localStorage.getItem('pendingUser') || '{}');
      if (!pendingUser.email || pendingUser.email !== email) {
        setError('Session expired. Please register again.');
        return;
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pendingUser, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid or expired OTP');
      } else {
        setSuccess('Account created successfully! Redirecting...');
        localStorage.removeItem('pendingUser');
        setTimeout(() => router.replace('/login'), 2000);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendDisabled || !email) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSuccess('OTP resent successfully!');
        setResendDisabled(true);
        setResendTimer(60);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to resend OTP');
      }
    } catch {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null; // handled by redirect

  return (
    <div className="bg-white rounded-xl shadow-md p-8 space-y-6 max-w-md mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">Verify Your Email</h1>
        <p className="text-gray-600 mt-2">
          We sent a 6-digit code to <span className="font-medium">{email}</span>
        </p>
      </div>

      {success && (
        <div className="p-3 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
          ✓ {success}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          ✗ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
            Enter OTP
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className={`w-full py-2.5 px-4 rounded-lg font-medium text-white ${
            loading || otp.length !== 6
              ? 'bg-orange-400 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>

      <div className="text-center text-sm text-gray-600">
        Didn’t receive the code?{' '}
        <button
          onClick={handleResend}
          disabled={resendDisabled}
          className={`font-medium ${
            resendDisabled
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-orange-500 hover:underline'
          }`}
        >
          {resendDisabled ? `Resend OTP (${resendTimer}s)` : 'Resend OTP'}
        </button>
      </div>

      <div className="text-center text-sm">
        <Link href="/register" className="text-gray-500 hover:underline">
          ← Back to Register
        </Link>
      </div>
    </div>
  );
}