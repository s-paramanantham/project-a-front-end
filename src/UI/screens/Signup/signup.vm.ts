import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/AuthService/authService';
import { validatePassword, isValidEmail, isValidPhone } from '../../../utils/Validation/validation';
import type { UserRole, PasswordValidationRules } from '../../../types/authTypes';

export interface SignupFormState {
  name: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  certificationId: string;
  termsAccepted: boolean;
}

export interface SignupFieldErrors {
  name?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  certificationId?: string;
  termsAccepted?: string;
}

export function useSignupViewModel() {
  const navigate = useNavigate();

  const [form, setForm] = useState<SignupFormState>({
    name: '',
    email: '',
    countryCode: '+1',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    certificationId: '',
    termsAccepted: false
  });

  const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasTypedPassword, setHasTypedPassword] = useState(false);

  // Dynamic live password validation
  const passwordRules: PasswordValidationRules = useMemo(() => {
    return validatePassword(form.password, form.confirmPassword);
  }, [form.password, form.confirmPassword]);

  const setRole = (role: UserRole) => {
    setForm((prev) => ({ ...prev, role }));
    // Clear tutor-specific errors if switching to student
    if (role === 'student') {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.certificationId;
        return next;
      });
    }
  };

  const updateField = <K extends keyof SignupFormState>(field: K, value: SignupFormState[K]) => {
    if (field === 'password' && !hasTypedPassword) {
      setHasTypedPassword(true);
    }

    setForm((prev) => ({ ...prev, [field]: value }));

    // Clear field-specific error as user edits
    if (fieldErrors[field as keyof SignupFieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  const validate = (): boolean => {
    const errors: SignupFieldErrors = {};

    if (!form.name.trim()) {
      errors.name = 'Full name is required';
    }

    if (!form.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!isValidEmail(form.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!form.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!isValidPhone(form.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number (digits only)';
    }

    if (form.role === 'tutor' && !form.certificationId.trim()) {
      errors.certificationId = 'Tutor Certification ID is required for verification';
    }

    if (!form.password) {
      errors.password = 'Password is required';
    } else if (!passwordRules.allPassed) {
      errors.password = 'Password does not meet all security requirements';
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (!passwordRules.passwordsMatch) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!form.termsAccepted) {
      errors.termsAccepted = 'You must accept the Terms & Conditions to proceed';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.signUp({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        countryCode: form.countryCode,
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
        role: form.role,
        certificationId: form.role === 'tutor' ? form.certificationId.trim() : undefined,
        termsAccepted: form.termsAccepted
      });

      if (response.success && response.requiresOtp) {
        // Navigate to /verify-otp passing context
        navigate('/verify-otp', {
          state: {
            email: form.email.trim().toLowerCase(),
            purpose: 'signup',
            role: form.role,
            signupData: {
              name: form.name.trim(),
              phone: form.phoneNumber.startsWith('+') ? form.phoneNumber.trim() : `${form.countryCode}${form.phoneNumber.trim()}`,
              countryCode: form.countryCode,
              role: form.role,
              certificationId: form.role === 'tutor' ? form.certificationId.trim() : undefined,
              password: form.password
            }
          }
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setGeneralError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    fieldErrors,
    generalError,
    isLoading,
    passwordRules,
    hasTypedPassword,
    setRole,
    updateField,
    handleSignup,
    navigateToLogin: () => navigate('/login')
  };
}
