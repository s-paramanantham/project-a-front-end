import type { PasswordValidationRules } from '../../types/authTypes';

export function validatePassword(password: string, confirmPassword = ''): PasswordValidationRules {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);
  const passwordsMatch = Boolean(password && confirmPassword && password === confirmPassword);

  const allPassed =
    minLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar &&
    passwordsMatch;

  return {
    minLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    passwordsMatch,
    allPassed
  };
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  // 6 to 15 digits
  const phoneRegex = /^[0-9]{6,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}
