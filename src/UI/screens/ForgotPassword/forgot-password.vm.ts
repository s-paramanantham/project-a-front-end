import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/AuthService/authService';
import { isValidEmail } from '../../../utils/Validation/validation';

export function useForgotPasswordViewModel() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateEmail = (value: string) => {
    setEmail(value);
    if (emailError) setEmailError(null);
    if (generalError) setGeneralError(null);
  };

  const validate = (): boolean => {
    if (!email.trim()) {
      setEmailError('Email address is required');
      return false;
    }
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.forgotPassword({
        email: email.trim().toLowerCase()
      });

      if (response.success) {
        // Flow: Forgot Password -> Enter Email -> OTP Verification
        navigate('/verify-otp', {
          state: {
            email: email.trim().toLowerCase(),
            purpose: 'forgot_password'
          }
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to initiate password reset.';
      setGeneralError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    emailError,
    generalError,
    isLoading,
    updateEmail,
    handleContinue,
    navigateToLogin: () => navigate('/login')
  };
}
