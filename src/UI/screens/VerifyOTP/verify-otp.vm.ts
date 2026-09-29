import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../../services/AuthService/authService';
import { isValidEmail } from '../../../utils/Validation/validation';
import type { OtpPurpose } from '../../../types/authTypes';

export interface VerifyOtpLocationState {
  email?: string;
  purpose?: OtpPurpose;
  role?: string;
  signupData?: {
    name?: string;
    phone?: string;
    countryCode?: string;
    role?: any;
    certificationId?: string;
    password?: string;
  };
}

const COUNTDOWN_SECONDS = 60;

export function useVerifyOtpViewModel() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as VerifyOtpLocationState) || {};

  const [email, setEmail] = useState<string>(state.email || 'user@example.com');
  const [purpose] = useState<OtpPurpose>(state.purpose || 'signup');
  const [otp, setOtp] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(COUNTDOWN_SECONDS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);
  const [tempEmail, setTempEmail] = useState<string>(email);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Countdown timer logic
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [countdown]);

  const handleOtpChange = (newOtp: string) => {
    setOtp(newOtp);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (otp.length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.verifyOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        purpose,
        signupData: state.signupData
      });

      if (response.success) {
        if (purpose === 'forgot_password') {
          // Flow: Forgot Password -> Enter Email -> OTP Verification -> Reset Password
          navigate('/reset-password', {
            state: {
              email: email.trim().toLowerCase(),
              otp: otp.trim()
            }
          });
        } else {
          // Flow: Email + Password -> Login -> OTP Screen -> Dashboard
          // or Signup -> OTP Screen -> Dashboard
          navigate('/dashboard', {
            state: {
              justVerified: true,
              role: state.role || response.user?.role || 'student'
            }
          });
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid code. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const response = await authService.resendOtp({
        email: email.trim().toLowerCase(),
        purpose
      });

      if (response.success) {
        setCountdown(COUNTDOWN_SECONDS);
        setOtp('');
        setInfoMessage(`A fresh verification code has been dispatched to ${email}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to resend code.';
      setErrorMessage(message);
    } finally {
      setIsResending(false);
    }
  };

  const handleSaveEmail = () => {
    if (!isValidEmail(tempEmail)) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    setEmail(tempEmail.trim().toLowerCase());
    setIsEditingEmail(false);
    setErrorMessage(null);
    setCountdown(COUNTDOWN_SECONDS);
    setInfoMessage(`Code will be sent to updated email: ${tempEmail.trim().toLowerCase()}`);
  };

  const purposeTitle = {
    signup: 'Verify your account',
    login: 'Two-Factor Authentication',
    forgot_password: 'Verify identity'
  }[purpose];

  return {
    email,
    purpose,
    purposeTitle,
    otp,
    countdown,
    canResend: countdown === 0,
    isLoading,
    isResending,
    errorMessage,
    infoMessage,
    isEditingEmail,
    tempEmail,
    setTempEmail,
    setIsEditingEmail,
    handleSaveEmail,
    handleOtpChange,
    handleVerify,
    handleResend,
    navigateToLogin: () => navigate('/login')
  };
}
