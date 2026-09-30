import type { IAuthService } from './authInterface';
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
  MOCK_DB: 'project_a_mock_users'
};

interface MockUserRecord {
  user: User;
  passwordHash: string;
  currentOtp?: string;
  isConfirmed: boolean;
}

export class MockAuthService implements IAuthService {
  private currentUser: User | null = null;
  private tokens: AuthTokens | null = null;
  private simulatedLatencyMs: number;
  private inMemoryDb: Record<string, MockUserRecord> | null = null;

  constructor(simulatedLatencyMs = 400) {
    this.simulatedLatencyMs = simulatedLatencyMs;
    this.restoreSession();
  }

  private async delay(): Promise<void> {
    if (this.simulatedLatencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.simulatedLatencyMs));
    }
  }

  private restoreSession(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        const tokenStr = localStorage.getItem(STORAGE_KEYS.TOKENS);
        if (userStr && tokenStr) {
          this.currentUser = JSON.parse(userStr);
          this.tokens = JSON.parse(tokenStr);
        }
      }
    } catch {
      this.clearSession();
    }
  }

  private saveSession(user: User, tokens: AuthTokens): void {
    this.currentUser = user;
    this.tokens = tokens;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
      }
    } catch {
      // Storage unavailable in non-browser env
    }
  }

  private clearSession(): void {
    this.currentUser = null;
    this.tokens = null;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKENS);
      }
    } catch {
      // Storage unavailable in non-browser env
    }
  }

  private getInitialDb(): Record<string, MockUserRecord> {
    return {
      'student@example.com': {
        user: {
          id: 'usr_student_01',
          name: 'Sarah Connor',
          email: 'student@example.com',
          role: 'student',
          phoneNumber: '9876543210',
          countryCode: '+1',
          emailVerified: true,
          createdAt: new Date().toISOString()
        },
        passwordHash: 'Password123!',
        isConfirmed: true
      },
      'tutor@example.com': {
        user: {
          id: 'usr_tutor_01',
          name: 'Prof. David Miller',
          email: 'tutor@example.com',
          role: 'tutor',
          certificationId: 'CERT-EDU-88219',
          phoneNumber: '9123456789',
          countryCode: '+44',
          emailVerified: true,
          createdAt: new Date().toISOString()
        },
        passwordHash: 'Password123!',
        isConfirmed: true
      }
    };
  }

  private getMockDb(): Record<string, MockUserRecord> {
    if (this.inMemoryDb) {
      return this.inMemoryDb;
    }

    try {
      if (typeof localStorage !== 'undefined') {
        const dbStr = localStorage.getItem(STORAGE_KEYS.MOCK_DB);
        if (dbStr) {
          this.inMemoryDb = JSON.parse(dbStr);
          return this.inMemoryDb!;
        }
      }
    } catch {
      // Storage unavailable
    }

    const initialDb = this.getInitialDb();
    this.inMemoryDb = initialDb;
    this.saveMockDb(initialDb);
    return initialDb;
  }

  private saveMockDb(db: Record<string, MockUserRecord>): void {
    this.inMemoryDb = db;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.MOCK_DB, JSON.stringify(db));
      }
    } catch {
      // Storage unavailable
    }
  }

  public async signUp(payload: SignUpPayload): Promise<AuthResponse> {
    await this.delay();

    const normalizedEmail = payload.email.toLowerCase().trim();
    const db = this.getMockDb();

    if (db[normalizedEmail] && db[normalizedEmail].isConfirmed) {
      throw new Error('An account with this email address already exists. Please login instead.');
    }

    const authorizedCredentials = ['Spananth12@2203', 'CERT-EDU-9901', 'CERT-EDU-88219'];
    if (payload.role === 'tutor' && (!payload.certificationId || !authorizedCredentials.includes(payload.certificationId))) {
      throw new Error('Invalid tutor credential ID. Please enter an authorized tutor credential ID.');
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: payload.name.trim(),
      email: normalizedEmail,
      role: payload.role,
      countryCode: payload.countryCode,
      phoneNumber: payload.phoneNumber,
      certificationId: payload.role === 'tutor' ? payload.certificationId : undefined,
      emailVerified: false,
      createdAt: new Date().toISOString()
    };

    db[normalizedEmail] = {
      user: newUser,
      passwordHash: payload.password,
      currentOtp: '123456',
      isConfirmed: false
    };

    this.saveMockDb(db);

    return {
      success: true,
      requiresOtp: true,
      otpDeliveryDestination: normalizedEmail,
      message: `Verification code sent to ${normalizedEmail}`
    };
  }

  public async login(payload: LoginPayload): Promise<AuthResponse> {
    await this.delay();

    const normalizedEmail = payload.email.toLowerCase().trim();
    const db = this.getMockDb();
    const record = db[normalizedEmail];

    if (!record || record.passwordHash !== payload.password) {
      throw new Error('Incorrect email address or password.');
    }

    record.currentOtp = '123456';
    this.saveMockDb(db);

    return {
      success: true,
      requiresOtp: true,
      otpDeliveryDestination: normalizedEmail,
      message: `Verification code sent to ${normalizedEmail}`
    };
  }

  public async verifyOtp(payload: VerifyOtpPayload): Promise<AuthResponse> {
    await this.delay();

    const normalizedEmail = payload.email.toLowerCase().trim();
    const db = this.getMockDb();
    const record = db[normalizedEmail];

    if (!record) {
      throw new Error('User not found. Please start authentication again.');
    }

    // Default mock verification accepts '123456' or matching currentOtp
    if (payload.otp !== '123456' && payload.otp !== record.currentOtp) {
      throw new Error('Invalid or expired verification code.');
    }

    record.isConfirmed = true;
    record.user.emailVerified = true;
    record.currentOtp = undefined;
    this.saveMockDb(db);

    if (payload.purpose === 'forgot_password') {
      return {
        success: true,
        message: 'Identity verified. You may now reset your password.'
      };
    }

    const tokens: AuthTokens = {
      accessToken: `mock_jwt_access_${Date.now()}`,
      idToken: `mock_jwt_id_${Date.now()}`,
      refreshToken: `mock_jwt_refresh_${Date.now()}`,
      expiresIn: 3600
    };

    this.saveSession(record.user, tokens);

    return {
      success: true,
      message: 'Authentication successful.',
      user: record.user,
      tokens
    };
  }

  public async resendOtp(payload: ResendOtpPayload): Promise<AuthResponse> {
    await this.delay();

    const normalizedEmail = payload.email.toLowerCase().trim();
    const db = this.getMockDb();
    const record = db[normalizedEmail];

    if (!record) {
      throw new Error('Account not found with this email.');
    }

    record.currentOtp = '123456';
    this.saveMockDb(db);

    return {
      success: true,
      message: `A fresh 6-digit verification code has been dispatched to ${normalizedEmail}`
    };
  }

  public async forgotPassword(payload: ForgotPasswordPayload): Promise<AuthResponse> {
    await this.delay();

    const normalizedEmail = payload.email.toLowerCase().trim();
    const db = this.getMockDb();
    const record = db[normalizedEmail];

    if (!record) {
      throw new Error('No registered account found with that email address.');
    }

    record.currentOtp = '123456';
    this.saveMockDb(db);

    return {
      success: true,
      requiresOtp: true,
      otpDeliveryDestination: normalizedEmail,
      message: `Password reset code sent to ${normalizedEmail}`
    };
  }

  public async resetPassword(payload: ResetPasswordPayload): Promise<AuthResponse> {
    await this.delay();

    const normalizedEmail = payload.email.toLowerCase().trim();
    const db = this.getMockDb();
    const record = db[normalizedEmail];

    if (!record) {
      throw new Error('Account not found.');
    }

    record.passwordHash = payload.newPassword;
    record.currentOtp = undefined;
    this.saveMockDb(db);

    return {
      success: true,
      message: 'Password reset successfully. You may now sign in with your new credentials.'
    };
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
    this.clearSession();
  }

  public resetMockDatabase(): void {
    this.clearSession();
    this.inMemoryDb = this.getInitialDb();
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.MOCK_DB);
      }
    } catch {
      // Ignore
    }
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
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
      }
    } catch {
      // Ignore
    }
    return this.currentUser;
  }

  public async updateUserProfileAPI(updates: Partial<User>): Promise<User> {
    return this.updateUserProfile(updates);
  }
}
