'use client';
import {useSession} from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';

// Enhanced Zod schema with better validation
const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Full name is required')
    .transform(val => val.trim())
    .refine(val => val.length > 0, 'Full name cannot be just spaces')
    .refine(val => val.length >= 3, 'Name must be at least 3 characters')
    .refine(val => val.length <= 50, 'Name must not exceed 50 characters')
    .refine(val => /^[a-zA-Z]+$/.test(val), 'Name can only contain alphabets (no spaces, numbers, or symbols)')
    .refine(val => /[a-zA-Z]/.test(val), 'Name must contain at least one letter'),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .transform(val => val.trim().toLowerCase())
    .refine(val => val.length > 0, 'Email cannot be just spaces')
    .refine(val => z.string().email().safeParse(val).success, 'Please enter a valid email address'),
  
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.trim() === '' || /^[0-9]{10}$/.test(val.replace(/[\s\-()]/g, '')),
      { message: 'Phone must be 10 digits' }
    )
    .transform(val => val ? val.replace(/[\s\-()]/g, '') : undefined),
  
  password: z
    .string()
    .min(1, 'Password is required')
    .refine(val => val.trim().length > 0, 'Password cannot be just spaces')
    .refine(val => val.length >= 8, 'Password must be at least 8 characters')
    .refine(val => val.length <= 100, 'Password must not exceed 100 characters')
    .refine(val => /[a-z]/.test(val), 'Password must contain at least one lowercase letter')
    .refine(val => /[A-Z]/.test(val), 'Password must contain at least one uppercase letter')
    .refine(val => /[0-9]/.test(val), 'Password must contain at least one number')
    .refine(val => /[@$!%*?&#]/.test(val), 'Password must contain at least one special character (@$!%*?&#)'),
  
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password')
    .refine(val => val.trim().length > 0, 'Password confirmation cannot be just spaces'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState(new Set());
  const [isFormValid, setIsFormValid] = useState(false);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/'); // or router.push('/')
    }
  }, [status, router]);
  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[@$!%*?&#]/.test(password)) strength += 15;
    return Math.min(strength, 100);
  };

  // Update form field
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Calculate password strength
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  // Mark field as touched
  const handleBlur = (field) => {
    setTouchedFields(prev => new Set([...prev, field]));
  };

  // Validate form on input change
  useEffect(() => {
    const validate = () => {
      const result = registerSchema.safeParse({
        name: formData.name,
        email: formData.email,
        phone: formData.phone.trim() || undefined,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (result.success) {
        setErrors({});
        setIsFormValid(true);
      } else {
        const fieldErrors = {};
        result.error.issues.forEach((issue) => {
          const field = issue.path[0];
          // Only show errors for touched fields
          if (touchedFields.has(field)) {
            fieldErrors[field] = issue.message;
          }
        });
        setErrors(fieldErrors);
        setIsFormValid(result.success);
      }
    };

    validate();
  }, [formData, touchedFields]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouchedFields(new Set(['name', 'email', 'phone', 'password', 'confirmPassword']));
    
    // Validate before submission
    const result = registerSchema.safeParse({
      name: formData.name,
      email: formData.email,
      phone: formData.phone.trim() || undefined,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

// Inside handleSubmit, after validation passes
try {
  setLoading(true);
  setSuccess('');
  setErrors({});

  // Step 1: Send OTP
  const otpRes = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: result.data.email }),
  });

  const otpData = await otpRes.json();

  if (!otpRes.ok) {
    setErrors({ form: otpData.error || 'Failed to send OTP' });
    return;
  }

  // Step 2: Save partial user data in localStorage or state (for now, localStorage)
  localStorage.setItem('pendingUser', JSON.stringify({
    name: result.data.name,
    email: result.data.email,
    phone: result.data.phone,
    password: result.data.password,
  }));

  // Step 3: Redirect to OTP verification page
  router.push(`/verify-otp?email=${encodeURIComponent(result.data.email)}`);
} catch (err) {
  console.error('OTP send error:', err);
  setErrors({ form: 'Failed to send OTP. Please try again.' });
} finally {
  setLoading(false);
}

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone,
          password: result.data.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle specific backend errors
        if (data.error) {
          const errorMsg = data.error.toLowerCase();
          
          // Check if error is about email or phone already existing
          if (errorMsg.includes('email') && errorMsg.includes('phone')) {
            // "User with this email or phone already exists"
            setErrors({ 
              form: data.error 
            });
          } else if (errorMsg.includes('email')) {
            setErrors({ 
              email: 'This email is already registered',
              form: data.error 
            });
            setTouchedFields(prev => new Set([...prev, 'email']));
          } else if (errorMsg.includes('phone')) {
            setErrors({ 
              phone: 'This phone number is already registered',
              form: data.error 
            });
            setTouchedFields(prev => new Set([...prev, 'phone']));
          } else {
            // Generic error message from backend
            setErrors({ form: data.error });
          }
        } else {
          setErrors({ form: 'Registration failed. Please try again.' });
        }
      } else {
        // Success
        setSuccess('Account created successfully! Redirecting to login...');
        // Clear form data
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
        });
        setTouchedFields(new Set());
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({ 
        form: err.message || 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 70) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8 space-y-6 max-w-md mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
        <p className="text-gray-500 mt-2">Join FoodConnects today</p>
      </div>

      {success && (
        <div className="p-3 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
          ✓ {success}
        </div>
      )}

      {errors.form && (
        <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
          ✗ {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
              errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span>⚠</span> {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
              errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            autoComplete="email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span>⚠</span> {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
              errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            autoComplete="tel"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span>⚠</span> {errors.phone}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition pr-10 ${
                errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600">
                  {getPasswordStrengthLabel()}
                </span>
              </div>
            </div>
          )}
          
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span>⚠</span> {errors.password}
            </p>
          )}
          
          {!errors.password && touchedFields.has('password') && formData.password && (
            <div className="mt-2 text-xs text-gray-600 space-y-1">
              <p>Password must contain:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                  One lowercase letter
                </li>
                <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                  One uppercase letter
                </li>
                <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                  One number
                </li>
                <li className={/[@$!%*?&#]/.test(formData.password) ? 'text-green-600' : ''}>
                  One special character (@$!%*?&#)
                </li>
                <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                  At least 8 characters
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition pr-10 ${
                errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span>⚠</span> {errors.confirmPassword}
            </p>
          )}
          {!errors.confirmPassword && 
           formData.confirmPassword && 
           formData.password === formData.confirmPassword && (
            <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
              <span>✓</span> Passwords match
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={`w-full py-2.5 px-4 rounded-lg font-medium text-white transition cursor-pointer ${
            loading || !isFormValid
              ? 'bg-orange-400 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-orange-500 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}