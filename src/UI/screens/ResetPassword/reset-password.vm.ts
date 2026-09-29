import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../../services/AuthService/authService';
import { validatePassword } from '../../../utils/Validation/validation';
import type { PasswordValidationRules } from '../../../types/authTypes';

export interface ResetPasswordLocationState {
  email?: string;
  otp?: string;
}

export function useResetPasswordViewModel() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as ResetPasswordLocationState) || {};

  const [email] = useState<string>(state.email || 'user@example.com');
  const [otp] = useState<string | undefined>(state.otp);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasTypedPassword, setHasTypedPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic live password validation
  const passwordRules: PasswordValidationRules = useMemo(() => {
    return validatePassword(newPassword, confirmPassword);
  }, [newPassword, confirmPassword]);

  const updateNewPassword = (val: string) => {
    if (!hasTypedPassword) setHasTypedPassword(true);
    setNewPassword(val);
    if (fieldErrors.newPassword) {
      setFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
    }
    if (generalError) setGeneralError(null);
  };

  const updateConfirmPassword = (val: string) => {
    setConfirmPassword(val);
    if (fieldErrors.confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
    if (generalError) setGeneralError(null);
  };

  const validate = (): boolean => {
    const errors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (!passwordRules.allPassed) {
      errors.newPassword = 'Password does not meet all security criteria';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm your new password';
    } else if (!passwordRules.passwordsMatch) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.resetPassword({
        email,
        otp,
        newPassword
      });

      if (response.success) {
        setSuccessMessage('Password reset successfully. Redirecting to login...');
        // After successful reset: Reset Password -> Login Page
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Password updated. Please sign in with your new credentials.' }
          });
        }, 1500);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reset password.';
      setGeneralError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    newPassword,
    confirmPassword,
    passwordRules,
    hasTypedPassword,
    fieldErrors,
    generalError,
    successMessage,
    isLoading,
    updateNewPassword,
    updateConfirmPassword,
    handleResetPassword,
    navigateToLogin: () => navigate('/login')
  };
}
