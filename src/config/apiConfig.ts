/**
 * API Configuration
 * Supports base URLs, endpoint routes, and timeout settings.
 */

export interface ApiConfiguration {
  baseUrl: string;
  timeout: number;
  endpoints: {
    login: string;
    signup: string;
    verifyOtp: string;
    resendOtp: string;
    forgotPassword: string;
    resetPassword: string;
    me: string;
    profile: string;
    logout: string;
  };
}

export const apiConfig: ApiConfiguration = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  endpoints: {
    login: '/users/login',
    signup: '/users/signup',
    verifyOtp: '/users/confirm-signup',
    resendOtp: '/users/resend-otp',
    forgotPassword: '/users/forgot-password',
    resetPassword: '/users/reset-password',
    me: '/users/me',
    profile: '/users/profile',
    logout: '/users/logout'
  }
};
