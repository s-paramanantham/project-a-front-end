import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/AuthService/authService';
import { isValidEmail } from '../../../utils/Validation/validation';

export interface LoginFormState {
  email: string;
  password: string;
}

export interface LoginFieldErrors {
  email?: string;
  password?: string;
}

export function useLoginViewModel() {
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginFormState>({
    email: '',
    password: ''
  });

  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateField = <K extends keyof LoginFormState>(field: K, value: LoginFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const validate = (): boolean => {
    const errors: LoginFieldErrors = {};

    if (!form.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!isValidEmail(form.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({
        email: form.email.trim().toLowerCase(),
        password: form.password
      });

      if (response.success) {
        // As defined in Project A Architecture:
        // Email + Password -> Login -> OTP Screen -> Dashboard
        navigate('/verify-otp', {
          state: {
            email: form.email.trim().toLowerCase(),
            purpose: 'login'
          }
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    fieldErrors,
    errorMessage,
    isLoading,
    updateField,
    handleLogin,
    navigateToForgotPassword: () => navigate('/forgot-password'),
    navigateToSignup: () => navigate('/signup')
  };
}
