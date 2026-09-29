import { describe, it, expect } from 'vitest';
import { validatePassword, isValidEmail, isValidPhone } from '../validation';

describe('Validation Utilities', () => {
  describe('validatePassword', () => {
    it('should fail if password has less than 8 characters', () => {
      const res = validatePassword('Pass1!', 'Pass1!');
      expect(res.minLength).toBe(false);
      expect(res.allPassed).toBe(false);
    });

    it('should fail if password lacks uppercase letter', () => {
      const res = validatePassword('password123!', 'password123!');
      expect(res.hasUppercase).toBe(false);
      expect(res.allPassed).toBe(false);
    });

    it('should fail if password lacks lowercase letter', () => {
      const res = validatePassword('PASSWORD123!', 'PASSWORD123!');
      expect(res.hasLowercase).toBe(false);
      expect(res.allPassed).toBe(false);
    });

    it('should fail if password lacks numbers', () => {
      const res = validatePassword('Password!!!!', 'Password!!!!');
      expect(res.hasNumber).toBe(false);
      expect(res.allPassed).toBe(false);
    });

    it('should fail if password lacks special character', () => {
      const res = validatePassword('Password123', 'Password123');
      expect(res.hasSpecialChar).toBe(false);
      expect(res.allPassed).toBe(false);
    });

    it('should fail if passwords do not match', () => {
      const res = validatePassword('Password123!', 'DifferentPassword123!');
      expect(res.passwordsMatch).toBe(false);
      expect(res.allPassed).toBe(false);
    });

    it('should pass all criteria when password is strong and confirmed', () => {
      const res = validatePassword('Password123!', 'Password123!');
      expect(res.minLength).toBe(true);
      expect(res.hasUppercase).toBe(true);
      expect(res.hasLowercase).toBe(true);
      expect(res.hasNumber).toBe(true);
      expect(res.hasSpecialChar).toBe(true);
      expect(res.passwordsMatch).toBe(true);
      expect(res.allPassed).toBe(true);
    });
  });

  describe('isValidEmail', () => {
    it('validates correct email addresses', () => {
      expect(isValidEmail('student@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@sub.domain.co')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('validates numeric phone numbers between 6 and 15 digits', () => {
      expect(isValidPhone('9876543210')).toBe(true);
      expect(isValidPhone('123456')).toBe(true);
      expect(isValidPhone('+1 (555) 019-2834')).toBe(true);
    });

    it('rejects too short or non-digit numbers', () => {
      expect(isValidPhone('1234')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
    });
  });
});
