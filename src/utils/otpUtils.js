// Utility functions for OTP generation and email simulation

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Utility functions for OTP generation and email simulation

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Simulate sending OTP via email
 * In a real app, this would be an API call to your backend
 * @param {string} email - User's email address
 * @param {string} otp - The OTP to send
 * @param {string} type - Type of OTP ('register' or 'reset')
 * @returns {Promise<Object>} Simulated response
 */
export const sendOTPEmail = async (email, otp, type = 'register') => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real app, you would send an actual email here
  // For now, we'll just log it and return success
  console.log(`OTP ${type}: Sending OTP ${otp} to ${email}`);

  // Simulate occasional failure for realism (5% failure rate)
  if (Math.random() < 0.05) {
    throw new Error('Failed to send OTP. Please try again.');
  }

  return {
    success: true,
    message: `OTP sent to ${email}`
  };
};

/**
 * Verify OTP (in a real app, this would be done on backend)
 * For this simulation, we'll store OTPs in memory/sessionStorage
 * @param {string} email - User's email address
 * @param {string} otp - OTP entered by user
 * @param {string} type - Type of OTP ('register' or 'reset')
 * @returns {Promise<boolean>} True if OTP is valid
 */
export const verifyOTP = async (email, otp, type = 'register') => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Get stored OTP from sessionStorage
  const storedData = sessionStorage.getItem(`otp_${type}_${email}`);
  if (!storedData) {
    return false;
  }

  const { code, expiresAt } = JSON.parse(storedData);

  // Check if OTP has expired (10 minutes)
  if (Date.now() > expiresAt) {
    sessionStorage.removeItem(`otp_${type}_${email}`);
    return false;
  }

  // Check if OTP matches
  if (code === otp) {
    // OTP is valid, remove it from storage (one-time use)
    sessionStorage.removeItem(`otp_${type}_${email}`);
    return true;
  }

  return false;
};

/**
 * Store OTP for verification (called after sending)
 * @param {string} email - User's email address
 * @param {string} otp - OTP to store
 * @param {string} type - Type of OTP ('register' or 'reset')
 */
export const storeOTP = (email, otp, type = 'register') => {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now
  const otpData = {
    code: otp,
    expiresAt: expiresAt
  };
  sessionStorage.setItem(`otp_${type}_${email}`, JSON.stringify(otpData));
};

/**
 * Verify OTP (in a real app, this would be done on backend)
 * For this simulation, we'll store OTPs in memory/sessionStorage
 * @param {string} email - User's email address
 * @param {string} otp - OTP entered by user
 * @param {string} type - Type of OTP ('register' or 'reset')
 * @returns {Promise<boolean>} True if OTP is valid
 */
export const verifyOTP = async (email, otp, type = 'register') => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Get stored OTP from sessionStorage
  const storedData = sessionStorage.getItem(`otp_${type}_${email}`);
  if (!storedData) {
    return false;
  }

  const { code, expiresAt } = JSON.parse(storedData);

  // Check if OTP has expired (10 minutes)
  if (Date.now() > expiresAt) {
    sessionStorage.removeItem(`otp_${type}_${email}`);
    return false;
  }

  // Check if OTP matches
  if (code === otp) {
    // OTP is valid, remove it from storage (one-time use)
    sessionStorage.removeItem(`otp_${type}_${email}`);
    return true;
  }

  return false;
};

/**
 * Store OTP for verification (called after sending)
 * @param {string} email - User's email address
 * @param {string} otp - OTP to store
 * @param {string} type - Type of OTP ('register' or 'reset')
 */
export const storeOTP = (email, otp, type = 'register') => {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now
  const otpData = {
    code: otp,
    expiresAt: expiresAt
  };
  sessionStorage.setItem(`otp_${type}_${email}`, JSON.stringify(otpData));
};