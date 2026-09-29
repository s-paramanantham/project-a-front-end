import { describe, it, expect } from 'vitest';
import { createAuthService, MockAuthService, CognitoAuthService } from '../authService';

describe('AuthService Factory and Environment Switching', () => {
  it('returns MockAuthService when forceMock is true', () => {
    const service = createAuthService(true);
    expect(service).toBeInstanceOf(MockAuthService);
  });

  it('returns CognitoAuthService when forceMock is false', () => {
    const service = createAuthService(false);
    expect(service).toBeInstanceOf(CognitoAuthService);
  });

  it('both implementations adhere strictly to IAuthService interface', () => {
    const mock = createAuthService(true);
    const cognito = createAuthService(false);

    const requiredMethods = [
      'signUp',
      'login',
      'verifyOtp',
      'resendOtp',
      'forgotPassword',
      'resetPassword',
      'getCurrentUser',
      'getTokens',
      'logout',
      'isAuthenticated'
    ] as const;

    requiredMethods.forEach((method) => {
      expect(typeof mock[method]).toBe('function');
      expect(typeof cognito[method]).toBe('function');
    });
  });
});
