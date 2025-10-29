// src/lib/otpStore.js
const otpStore = new Map(); // { email: { otp: '123456', expiresAt: Date } }

export const setOTP = (email, otp) => {
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 60 * 1000, // 5 min expiry
    sentAt: Date.now(),
  });
};

export const getOTP = (email) => {
  const record = otpStore.get(email);
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return null;
  }
  return record.otp;
};

export const getOTPLastSent = (email) => {
  const record = otpStore.get(email);
  return record ? record.sentAt : null;
};

export const deleteOTP = (email) => {
  otpStore.delete(email);
};
