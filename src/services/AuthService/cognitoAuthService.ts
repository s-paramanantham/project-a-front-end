import type { IAuthService } from './authInterface';
import { apiConfig } from '../../config/apiConfig';
import { apiClient, ApiError } from '../../client/api.client';
import {
  signUpInCognito,
  confirmSignUpInCognito,
  loginInCognito,
  respondToAuthChallengeInCognito,
  resendOtpInCognito,
  forgotPasswordInCognito,
  resetPasswordInCognito,
  CognitoClientError
} from '../../client/cognitoClient';
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

const STORAGE_KEYS = {
  USER: 'project_a_user',
  TOKENS: 'project_a_tokens',
  PENDING_SIGNUP: 'project_a_pending_signup',
  LOGIN_CHALLENGE: 'project_a_login_challenge'
};

export class CognitoAuthService implements IAuthService {
  private currentUser: User | null = null;
  private tokens: AuthTokens | null = null;

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      const tokenStr = localStorage.getItem(STORAGE_KEYS.TOKENS);
      if (userStr && tokenStr) {
        this.currentUser = JSON.parse(userStr);
        this.tokens = JSON.parse(tokenStr);
        apiClient.setTokenGetter(() => this.tokens?.accessToken || null);
      }
    } catch {
      this.clearSession();
    }
  }

  private saveSession(user: User, tokens: AuthTokens): void {
    this.currentUser = user;
    this.tokens = tokens;
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
      apiClient.setTokenGetter(() => tokens.accessToken);
    } catch {
      // Storage unavailable
    }
  }

  private clearSession(): void {
    this.currentUser = null;
    this.tokens = null;
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKENS);
      sessionStorage.removeItem(STORAGE_KEYS.PENDING_SIGNUP);
      apiClient.setTokenGetter(() => null);
    } catch {
      // Storage unavailable
    }
  }

  /**
   * Step 1 of Signup:
   * Front-end creates the user directly in AWS Cognito.
   * Caches pending profile details for the subsequent BE DB entry step.
   */
  public async signUp(payload: SignUpPayload): Promise<AuthResponse> {
    try {
      const email = payload.email.trim().toLowerCase();
      const phone = payload.phoneNumber.startsWith('+')
        ? payload.phoneNumber
        : `${payload.countryCode || '+1'}${payload.phoneNumber}`;

      // If registering as TUTOR, strictly validate credential ID from DB BEFORE calling Cognito
      if (payload.role && payload.role.toUpperCase() === 'TUTOR') {
        const certId = payload.certificationId?.trim();
        if (!certId) {
          throw new Error('Certification / Credential ID is required for Tutor account creation.');
        }
        try {
          const checkRes = await apiClient.post<any>('/users/validate-tutor-credential', {
            credentialId: certId
          });
          if (checkRes.data?.valid === false) {
            throw new Error(checkRes.message || 'Invalid tutor credential ID. Please enter an authorized credential ID.');
          }
        } catch (validationErr: any) {
          throw new Error(
            validationErr?.response?.data?.message ||
            validationErr?.message ||
            'Invalid tutor credential ID. Please enter an authorized credential ID.'
          );
        }
      }

      // 1. Create the user in AWS Cognito directly from Frontend
      await signUpInCognito(payload);

      // 2. Temporarily retain registration info in sessionStorage so it can be sent
      // to BE with the Cognito token once confirmed via OTP
      const pendingProfile = {
        email,
        name: payload.name.trim(),
        phone,
        countryCode: payload.countryCode,
        role: payload.role,
        certificationId: payload.certificationId,
        password: payload.password
      };

      try {
        sessionStorage.setItem(STORAGE_KEYS.PENDING_SIGNUP, JSON.stringify(pendingProfile));
      } catch {
        // Session storage might be disabled
      }

      return {
        success: true,
        message: 'Account created in Cognito. A verification code has been sent to your email.',
        requiresOtp: true
      };
    } catch (err: unknown) {
      if (err instanceof CognitoClientError) {
        throw new Error(err.message);
      }
      throw new Error(err instanceof Error ? err.message : 'Cognito registration failed.');
    }
  }

  /**
   * Step 2 of Signup & Verification:
   * 1. Confirms user in AWS Cognito using confirmation OTP code.
   * 2. Logs in to Cognito to obtain authentic Cognito ID & Access tokens.
   * 3. Calls Backend Signup API passing the Cognito token in Authorization header & body.
   * 4. Backend validates token and enters user into PostgreSQL database.
   */
  public async verifyOtp(payload: VerifyOtpPayload): Promise<AuthResponse> {
    try {
      const cleanEmail = payload.email.trim().toLowerCase();

      if (payload.purpose === 'signup') {
        // 1. Confirm signup in AWS Cognito
        await confirmSignUpInCognito(cleanEmail, payload.otp);

        // 2. Retrieve cached registration profile
        let pending: any = payload.signupData;
        if (!pending) {
          try {
            const cached = sessionStorage.getItem(STORAGE_KEYS.PENDING_SIGNUP);
            if (cached) pending = JSON.parse(cached);
          } catch {
            // Ignore parse errors
          }
        }

        // 3. Authenticate with Cognito to obtain tokens
        let tokens: AuthTokens | undefined;
        if (pending?.password) {
          const authResult = await loginInCognito({
            email: cleanEmail,
            password: pending.password
          });
          tokens = authResult.tokens;
        }

        const cognitoToken = tokens?.idToken || tokens?.accessToken || '';

        // 4. Call Backend signup API with Cognito token so BE validates token and creates DB entry
        const bePayload = {
          email: cleanEmail,
          cognitoToken,
          name: pending?.name || 'User',
          phone: pending?.phone || '+1234567890',
          role: (pending?.role || 'STUDENT').toUpperCase(),
          certificationId: pending?.certificationId
        };

        const response = await apiClient.post<any>(
          apiConfig.endpoints.signup,
          bePayload,
          {
            headers: cognitoToken ? { Authorization: `Bearer ${cognitoToken}` } : {}
          }
        );

        const dbUser = response.data?.user;
        const mappedUser: User = {
          id: dbUser?.id || dbUser?.cognito_user_id || 'user-id',
          name: dbUser?.name || bePayload.name,
          email: dbUser?.email || cleanEmail,
          role: (dbUser?.role ? dbUser.role.toLowerCase() : (pending?.role || 'student')),
          phoneNumber: dbUser?.phone || bePayload.phone,
          certificationId: pending?.certificationId,
          emailVerified: true,
          createdAt: dbUser?.created_at || new Date().toISOString()
        };

        if (tokens) {
          this.saveSession(mappedUser, tokens);
        }

        try {
          sessionStorage.removeItem(STORAGE_KEYS.PENDING_SIGNUP);
        } catch {
          // Ignore
        }

        return {
          success: true,
          message: response.message || 'Account confirmed and registered successfully in database.',
          user: mappedUser,
          tokens
        };
      }

      if (payload.purpose === 'login') {
        let challengeInfo: any = null;
        try {
          const cached = sessionStorage.getItem(STORAGE_KEYS.LOGIN_CHALLENGE);
          if (cached) challengeInfo = JSON.parse(cached);
        } catch {
          // ignore
        }

        let tokens: AuthTokens | null = this.tokens;

        // If Cognito challenge session exists, respond to challenge to get tokens
        if (challengeInfo?.challenge?.session) {
          tokens = await respondToAuthChallengeInCognito({
            email: cleanEmail,
            challengeName: challengeInfo.challenge.challengeName || 'EMAIL_OTP',
            session: challengeInfo.challenge.session,
            otp: payload.otp
          });
        }

        const cognitoToken = tokens?.idToken || tokens?.accessToken || '';

        // Call BE login API with Cognito token so BE validates token and returns user
        const response = await apiClient.post<any>(
          apiConfig.endpoints.login,
          { email: cleanEmail, cognitoToken },
          { headers: cognitoToken ? { Authorization: `Bearer ${cognitoToken}` } : {} }
        );

        const dbUser = response.data?.user;
        const mappedUser: User = {
          id: dbUser?.id || dbUser?.cognito_user_id || 'user-id',
          name: dbUser?.name || cleanEmail.split('@')[0],
          email: dbUser?.email || cleanEmail,
          role: dbUser?.role ? dbUser.role.toLowerCase() : 'student',
          phoneNumber: dbUser?.phone,
          emailVerified: true,
          createdAt: dbUser?.created_at || new Date().toISOString()
        };

        if (tokens) {
          this.saveSession(mappedUser, tokens);
        }

        try {
          sessionStorage.removeItem(STORAGE_KEYS.LOGIN_CHALLENGE);
        } catch {
          // ignore
        }

        return {
          success: true,
          message: response.message || 'Login successful.',
          user: mappedUser,
          tokens: tokens || undefined
        };
      }

      if (payload.purpose === 'forgot_password') {
        return {
          success: true,
          message: 'Code verified successfully.'
        };
      }

      // Default fallback
      return {
        success: true,
        message: 'Verification successful.'
      };
    } catch (err: unknown) {
      if (err instanceof CognitoClientError) {
        throw new Error(err.message);
      }
      if (err instanceof ApiError) {
        throw new Error(err.message);
      }
      throw new Error(err instanceof Error ? err.message : 'Verification failed.');
    }
  }

  /**
   * Log in user via AWS Cognito:
   * 1. Validates credentials with AWS Cognito directly.
   * 2. If Cognito issues an MFA / OTP challenge, prompts for OTP verification.
   * 3. Once validated, calls BE Login API with Cognito token.
   */
  public async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const cleanEmail = payload.email.trim().toLowerCase();
      const cognitoResult = await loginInCognito({
        email: cleanEmail,
        password: payload.password
      });

      // If Cognito issued an authentication challenge (such as EMAIL_OTP)
      if (cognitoResult.challenge) {
        try {
          sessionStorage.setItem(STORAGE_KEYS.LOGIN_CHALLENGE, JSON.stringify({
            email: cleanEmail,
            challenge: cognitoResult.challenge
          }));
        } catch {
          // ignore
        }

        return {
          success: true,
          message: 'A verification code has been dispatched to your email.',
          requiresOtp: true,
          otpDeliveryDestination: cognitoResult.challenge?.challengeParameters?.CODE_DELIVERY_DESTINATION
        };
      }

      const tokens = cognitoResult.tokens;
      if (!tokens) {
        throw new Error('Authentication did not return valid tokens.');
      }

      // If pool didn't issue challenge, call BE login API with token
      const response = await apiClient.post<any>(
        apiConfig.endpoints.login,
        { email: cleanEmail, cognitoToken: tokens.idToken },
        { headers: { Authorization: `Bearer ${tokens.idToken}` } }
      );

      const dbUser = response.data?.user;
      const user: User = {
        id: dbUser?.id || dbUser?.cognito_user_id || 'user-id',
        name: dbUser?.name || cleanEmail.split('@')[0],
        email: dbUser?.email || cleanEmail,
        role: dbUser?.role ? dbUser.role.toLowerCase() : 'student',
        phoneNumber: dbUser?.phone,
        emailVerified: true,
        createdAt: dbUser?.created_at || new Date().toISOString()
      };

      this.saveSession(user, tokens);

      return {
        success: true,
        message: 'Login successful',
        tokens,
        user
      };
    } catch (err: unknown) {
      if (err instanceof CognitoClientError) {
        throw new Error(err.message);
      }
      if (err instanceof ApiError) {
        throw new Error(err.message);
      }
      throw new Error(err instanceof Error ? err.message : 'Authentication failed.');
    }
  }

  public async resendOtp(payload: ResendOtpPayload): Promise<AuthResponse> {
    try {
      await resendOtpInCognito(payload.email);
      return {
        success: true,
        message: 'A fresh confirmation code has been resent to your email.'
      };
    } catch (err: unknown) {
      if (err instanceof CognitoClientError) {
        throw new Error(err.message);
      }
      throw new Error('Failed to resend confirmation code.');
    }
  }

  public async forgotPassword(payload: ForgotPasswordPayload): Promise<AuthResponse> {
    try {
      await forgotPasswordInCognito(payload);
      return {
        success: true,
        message: 'Password reset code has been sent to your email.'
      };
    } catch (err: unknown) {
      if (err instanceof CognitoClientError) {
        throw new Error(err.message);
      }
      throw new Error('Unable to process password reset request.');
    }
  }

  public async resetPassword(payload: ResetPasswordPayload): Promise<AuthResponse> {
    try {
      await resetPasswordInCognito(payload);
      return {
        success: true,
        message: 'Password has been reset successfully in Cognito. You can now log in.'
      };
    } catch (err: unknown) {
      if (err instanceof CognitoClientError) {
        throw new Error(err.message);
      }
      throw new Error('Failed to reset password.');
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public getTokens(): AuthTokens | null {
    return this.tokens;
  }

  public isAuthenticated(): boolean {
    return Boolean(this.currentUser && this.tokens);
  }

  public async logout(): Promise<void> {
    if (this.tokens) {
      try {
        await apiClient.post(apiConfig.endpoints.logout, { token: this.tokens.accessToken });
      } catch {
        // Clear local session anyway
      }
    }
    this.clearSession();
  }

  public updateUserProfile(updates: Partial<User>): User {
    if (!this.currentUser) {
      throw new Error('No user is currently signed in');
    }
    this.currentUser = {
      ...this.currentUser,
      ...updates,
      education: { ...this.currentUser.education, ...updates.education },
      work: { ...this.currentUser.work, ...updates.work },
      address: { ...this.currentUser.address, ...updates.address }
    };
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
    } catch {
      // Storage unavailable
    }
    return this.currentUser;
  }

  public async updateUserProfileAPI(updates: Partial<User>): Promise<User> {
    const updated = this.updateUserProfile(updates);
    try {
      const response = await apiClient.put<any>(apiConfig.endpoints.profile, {
        userId: updated.id,
        email: updated.email,
        name: updated.name,
        phone: updated.phoneNumber,
        avatarUrl: updated.avatarUrl,
        coverUrl: updated.coverUrl,
        education: updated.education,
        work: updated.work,
        address: updated.address
      });

      if (response?.data) {
        const dbUser = response.data;
        const syncedUser: User = {
          ...updated,
          name: dbUser.name || updated.name,
          phoneNumber: dbUser.phone !== undefined ? dbUser.phone : updated.phoneNumber,
          avatarUrl: dbUser.avatar_url !== undefined ? dbUser.avatar_url : updated.avatarUrl,
          coverUrl: dbUser.cover_url !== undefined ? dbUser.cover_url : updated.coverUrl,
          education: dbUser.education || updated.education,
          work: dbUser.work || updated.work,
          address: dbUser.address || updated.address
        };
        this.currentUser = syncedUser;
        try {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(syncedUser));
        } catch {}
        return syncedUser;
      }
    } catch (err) {
      console.warn('Could not sync profile to backend:', err);
    }
    return updated;
  }
}

export default CognitoAuthService;
