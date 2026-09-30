import type { IAuthService } from './authInterface';
import { MockAuthService } from './mockAuthService';
import { CognitoAuthService } from './cognitoAuthService';
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

/**
 * Environment-based mock determination:
 * 1. Checks VITE_IS_MOCK (e.g. 'true' or 'false' in .env)
 * 2. If 'false', connects to the Project A Backend API via CognitoAuthService
 * 3. Defaults to false if not set so backend API is used
 */
const envMockValue = import.meta.env.VITE_IS_MOCK;

export const IS_MOCK: boolean =
  envMockValue !== undefined
    ? envMockValue === 'true' || envMockValue === true
    : false;

/**
 * AuthService Factory
 * Returns MockAuthService or CognitoAuthService (Backend API client) based on environment or override.
 */
export function createAuthService(forceMock?: boolean): IAuthService {
  const shouldUseMock = forceMock !== undefined ? forceMock : IS_MOCK;
  return shouldUseMock ? new MockAuthService() : new CognitoAuthService();
}

/**
 * Primary singleton authentication service instance used across ViewModels
 */
export const authService: IAuthService = createAuthService();

/**
 * Function-based API exports for direct functional usage
 */
export const signUp = (payload: SignUpPayload): Promise<AuthResponse> => authService.signUp(payload);
export const login = (payload: LoginPayload): Promise<AuthResponse> => authService.login(payload);
export const verifyOtp = (payload: VerifyOtpPayload): Promise<AuthResponse> => authService.verifyOtp(payload);
export const resendOtp = (payload: ResendOtpPayload): Promise<AuthResponse> => authService.resendOtp(payload);
export const forgotPassword = (payload: ForgotPasswordPayload): Promise<AuthResponse> => authService.forgotPassword(payload);
export const resetPassword = (payload: ResetPasswordPayload): Promise<AuthResponse> => authService.resetPassword(payload);
export const getCurrentUser = (): User | null => authService.getCurrentUser();
export const getTokens = (): AuthTokens | null => authService.getTokens();
export const isAuthenticated = (): boolean => authService.isAuthenticated();
export const logout = (): Promise<void> => authService.logout();
export const updateUserProfile = (updates: Partial<User>): User => authService.updateUserProfile(updates);
export const updateUserProfileAPI = (updates: Partial<User>): Promise<User> => authService.updateUserProfileAPI(updates);

export type { IAuthService } from './authInterface';
export { MockAuthService } from './mockAuthService';
export { CognitoAuthService } from './cognitoAuthService';
export default authService;
