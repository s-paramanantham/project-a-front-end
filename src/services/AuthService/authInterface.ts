import type {
  AuthResponse,
  LoginPayload,
  SignUpPayload,
  VerifyOtpPayload,
  ResendOtpPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  User,
  AuthTokens
} from '../../types/authTypes';

export interface IAuthService {
  signUp(payload: SignUpPayload): Promise<AuthResponse>;
  login(payload: LoginPayload): Promise<AuthResponse>;
  verifyOtp(payload: VerifyOtpPayload): Promise<AuthResponse>;
  resendOtp(payload: ResendOtpPayload): Promise<AuthResponse>;
  forgotPassword(payload: ForgotPasswordPayload): Promise<AuthResponse>;
  resetPassword(payload: ResetPasswordPayload): Promise<AuthResponse>;
  getCurrentUser(): User | null;
  getTokens(): AuthTokens | null;
  logout(): Promise<void>;
  isAuthenticated(): boolean;
  updateUserProfile(updates: Partial<User>): User;
  updateUserProfileAPI(updates: Partial<User>): Promise<User>;
}
