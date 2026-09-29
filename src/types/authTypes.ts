export type UserRole = 'student' | 'tutor';

export type OtpPurpose = 'signup' | 'login' | 'forgot_password';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  countryCode?: string;
  certificationId?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  requiresOtp?: boolean;
  otpDeliveryDestination?: string;
  user?: User;
  tokens?: AuthTokens;
  error?: string;
}

export interface SignUpPayload {
  name: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  password: string;
  role: UserRole;
  certificationId?: string;
  termsAccepted: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  purpose: OtpPurpose;
  signupData?: {
    name?: string;
    phone?: string;
    countryCode?: string;
    role?: UserRole;
    certificationId?: string;
    password?: string;
  };
}

export interface ResendOtpPayload {
  email: string;
  purpose: OtpPurpose;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp?: string;
  newPassword: string;
}

export interface PasswordValidationRules {
  minLength: boolean;      // At least 8 characters
  hasUppercase: boolean;   // At least one uppercase letter (A-Z)
  hasLowercase: boolean;   // At least one lowercase letter (a-z)
  hasNumber: boolean;      // At least one numeric digit (0-9)
  hasSpecialChar: boolean; // At least one special character (!@#$%^&*...)
  passwordsMatch: boolean; // Matches confirm password
  allPassed: boolean;      // All criteria met
}

export interface CountryCodeOption {
  code: string;
  dialCode: string;
  label: string;
  flag: string;
}
