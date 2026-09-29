import { describe, it, expect, beforeEach } from 'vitest';
import { MockAuthService } from '../mockAuthService';

describe('MockAuthService', () => {
  let service: MockAuthService;

  beforeEach(() => {
    // Zero latency for instantaneous unit tests
    service = new MockAuthService(0);
    service.resetMockDatabase();
  });

  describe('Login Flow', () => {
    it('successfully initiates login for seeded student and requests OTP', async () => {
      const response = await service.login({
        email: 'student@example.com',
        password: 'Password123!'
      });

      expect(response.success).toBe(true);
      expect(response.requiresOtp).toBe(true);
      expect(response.otpDeliveryDestination).toBe('student@example.com');
    });

    it('rejects login with invalid password', async () => {
      await expect(
        service.login({
          email: 'student@example.com',
          password: 'WrongPassword!'
        })
      ).rejects.toThrow('Incorrect email address or password.');
    });

    it('rejects login for non-existent user', async () => {
      await expect(
        service.login({
          email: 'unknown@example.com',
          password: 'Password123!'
        })
      ).rejects.toThrow('Incorrect email address or password.');
    });
  });

  describe('OTP Verification Flow', () => {
    it('verifies 123456 OTP and returns session tokens and user info', async () => {
      // Step 1: Login
      await service.login({
        email: 'student@example.com',
        password: 'Password123!'
      });

      // Step 2: Verify OTP
      const response = await service.verifyOtp({
        email: 'student@example.com',
        otp: '123456',
        purpose: 'login'
      });

      expect(response.success).toBe(true);
      expect(response.user).toBeDefined();
      expect(response.user?.email).toBe('student@example.com');
      expect(response.tokens?.accessToken).toBeDefined();
      expect(service.isAuthenticated()).toBe(true);
      expect(service.getCurrentUser()?.email).toBe('student@example.com');
    });

    it('rejects invalid OTP code', async () => {
      await service.login({
        email: 'student@example.com',
        password: 'Password123!'
      });

      await expect(
        service.verifyOtp({
          email: 'student@example.com',
          otp: '000000',
          purpose: 'login'
        })
      ).rejects.toThrow('Invalid or expired verification code.');
    });

    it('resends fresh OTP code successfully', async () => {
      const response = await service.resendOtp({
        email: 'student@example.com',
        purpose: 'login'
      });

      expect(response.success).toBe(true);
      expect(response.message).toContain('6-digit verification code');
    });
  });

  describe('Sign Up Flow', () => {
    it('registers a new Student and requires OTP verification', async () => {
      const email = `newstudent_${Date.now()}@example.com`;
      const response = await service.signUp({
        name: 'Jordan Lee',
        email,
        countryCode: '+1',
        phoneNumber: '8005550199',
        password: 'SecurePassword123!',
        role: 'student',
        termsAccepted: true
      });

      expect(response.success).toBe(true);
      expect(response.requiresOtp).toBe(true);
      expect(response.otpDeliveryDestination).toBe(email);

      // Verify OTP to complete registration
      const verifyRes = await service.verifyOtp({
        email,
        otp: '123456',
        purpose: 'signup'
      });

      expect(verifyRes.success).toBe(true);
      expect(verifyRes.user?.name).toBe('Jordan Lee');
      expect(verifyRes.user?.role).toBe('student');
    });

    it('registers a Tutor with certification ID', async () => {
      const email = `newtutor_${Date.now()}@example.com`;
      const response = await service.signUp({
        name: 'Dr. Evelyn Reed',
        email,
        countryCode: '+44',
        phoneNumber: '7911123456',
        password: 'SecurePassword123!',
        role: 'tutor',
        certificationId: 'CERT-EDU-9901',
        termsAccepted: true
      });

      expect(response.success).toBe(true);

      const verifyRes = await service.verifyOtp({
        email,
        otp: '123456',
        purpose: 'signup'
      });

      expect(verifyRes.user?.role).toBe('tutor');
      expect(verifyRes.user?.certificationId).toBe('CERT-EDU-9901');
    });

    it('prevents registration with already registered and confirmed email', async () => {
      await expect(
        service.signUp({
          name: 'Sarah Connor',
          email: 'student@example.com',
          countryCode: '+1',
          phoneNumber: '9876543210',
          password: 'Password123!',
          role: 'student',
          termsAccepted: true
        })
      ).rejects.toThrow('An account with this email address already exists.');
    });
  });

  describe('Password Recovery Flow', () => {
    it('initiates forgot password for existing account', async () => {
      const response = await service.forgotPassword({
        email: 'student@example.com'
      });

      expect(response.success).toBe(true);
      expect(response.requiresOtp).toBe(true);
    });

    it('completes password reset and allows login with new password', async () => {
      await service.forgotPassword({ email: 'student@example.com' });

      // Step 2: Verify OTP
      await service.verifyOtp({
        email: 'student@example.com',
        otp: '123456',
        purpose: 'forgot_password'
      });

      // Step 3: Reset Password
      const resetRes = await service.resetPassword({
        email: 'student@example.com',
        newPassword: 'BrandNewPassword123!'
      });

      expect(resetRes.success).toBe(true);

      // Verify login works with new password
      const newLogin = await service.login({
        email: 'student@example.com',
        password: 'BrandNewPassword123!'
      });
      expect(newLogin.success).toBe(true);
    });
  });

  describe('Session and Logout', () => {
    it('logs out and clears session state', async () => {
      await service.login({ email: 'student@example.com', password: 'Password123!' });
      await service.verifyOtp({ email: 'student@example.com', otp: '123456', purpose: 'login' });

      expect(service.isAuthenticated()).toBe(true);

      await service.logout();

      expect(service.isAuthenticated()).toBe(false);
      expect(service.getCurrentUser()).toBeNull();
      expect(service.getTokens()).toBeNull();
    });
  });
});
