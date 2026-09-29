import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  type SignUpCommandInput,
  ConfirmSignUpCommand,
  type ConfirmSignUpCommandInput,
  InitiateAuthCommand,
  type InitiateAuthCommandInput,
  RespondToAuthChallengeCommand,
  type RespondToAuthChallengeCommandInput,
  ResendConfirmationCodeCommand,
  type ResendConfirmationCodeCommandInput,
  ForgotPasswordCommand,
  type ForgotPasswordCommandInput,
  ConfirmForgotPasswordCommand,
  type ConfirmForgotPasswordCommandInput,
  AuthFlowType
} from '@aws-sdk/client-cognito-identity-provider';
import type {
  SignUpPayload,
  LoginPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  AuthTokens
} from '../types/authTypes';

export class CognitoClientError extends Error {
  public code: string;
  public statusCode: number;

  constructor(message: string, code: string = 'CognitoError', statusCode: number = 400) {
    super(message);
    this.name = 'CognitoClientError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

const region = import.meta.env.VITE_AWS_REGION || 'us-east-1';
const clientId = import.meta.env.VITE_AWS_CLIENT_ID || '';
const clientSecret = import.meta.env.VITE_AWS_CLIENT_SECRET || '';

// Singleton Cognito IDP client
const client = new CognitoIdentityProviderClient({ region });

/**
 * Computes the HMAC-SHA256 SecretHash in browser or fallback.
 */
export async function computeSecretHash(username: string): Promise<string | undefined> {
  if (!clientSecret || !clientId) {
    return undefined;
  }

  const message = username + clientId;

  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(clientSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await window.crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(message)
    );
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  return undefined;
}

/**
 * Map AWS Cognito errors to friendly user messages.
 */
function handleCognitoError(error: any): never {
  const errorName = error.name || error.__type || 'CognitoError';
  const message = error.message || 'An error occurred with Cognito authentication.';

  switch (errorName) {
    case 'UsernameExistsException':
      throw new CognitoClientError('An account with this email address already exists in Cognito.', errorName, 409);
    case 'CodeMismatchException':
      throw new CognitoClientError('Invalid verification code. Please check and try again.', errorName, 400);
    case 'ExpiredCodeException':
      throw new CognitoClientError('Verification code has expired. Please request a new code.', errorName, 400);
    case 'NotAuthorizedException':
      throw new CognitoClientError('Incorrect email or password.', errorName, 401);
    case 'UserNotConfirmedException':
      throw new CognitoClientError('Your account is not confirmed yet. Please verify your email first.', errorName, 403);
    case 'UserNotFoundException':
      throw new CognitoClientError('No account found with this email address.', errorName, 404);
    case 'InvalidParameterException':
      if (message.includes('USER_PASSWORD_AUTH')) {
        throw new CognitoClientError(
          'USER_PASSWORD_AUTH is not enabled in AWS Cognito. Please go to Cognito Console > App Integration > App Client > Edit Authentication Flows and check "ALLOW_USER_PASSWORD_AUTH".',
          errorName,
          400
        );
      }
      throw new CognitoClientError(message, errorName, 400);
    case 'LimitExceededException':
    case 'TooManyRequestsException':
      throw new CognitoClientError('Attempt limit exceeded. Please try again later.', errorName, 429);
    default:
      throw new CognitoClientError(message, errorName, error.$metadata?.httpStatusCode || 400);
  }
}

/**
 * Step 1: Create user directly in AWS Cognito.
 */
export async function signUpInCognito(payload: SignUpPayload): Promise<{
  userSub: string;
  userConfirmed: boolean;
}> {
  if (!clientId) {
    throw new CognitoClientError('Cognito Client ID is not configured in frontend environment.', 'ConfigError', 500);
  }

  const email = payload.email.trim().toLowerCase();
  const secretHash = await computeSecretHash(email);

  const phone = payload.phoneNumber.startsWith('+')
    ? payload.phoneNumber
    : `${payload.countryCode || '+1'}${payload.phoneNumber}`;

  const userAttributes = [
    { Name: 'email', Value: email },
    { Name: 'name', Value: payload.name.trim() },
    { Name: 'phone_number', Value: phone }
  ];

  const input: SignUpCommandInput = {
    ClientId: clientId,
    Username: email,
    Password: payload.password,
    SecretHash: secretHash,
    UserAttributes: userAttributes
  };

  try {
    const command = new SignUpCommand(input);
    const response = await client.send(command);

    return {
      userSub: response.UserSub || '',
      userConfirmed: response.UserConfirmed || false
    };
  } catch (error: any) {
    handleCognitoError(error);
  }
}

/**
 * Step 2: Confirm user signup in AWS Cognito with confirmation OTP code.
 */
export async function confirmSignUpInCognito(email: string, confirmationCode: string): Promise<boolean> {
  if (!clientId) {
    throw new CognitoClientError('Cognito Client ID is not configured.', 'ConfigError', 500);
  }

  const cleanEmail = email.trim().toLowerCase();
  const secretHash = await computeSecretHash(cleanEmail);

  const input: ConfirmSignUpCommandInput = {
    ClientId: clientId,
    Username: cleanEmail,
    ConfirmationCode: confirmationCode.trim(),
    SecretHash: secretHash
  };

  try {
    const command = new ConfirmSignUpCommand(input);
    await client.send(command);
    return true;
  } catch (error: any) {
    handleCognitoError(error);
  }
}

/**
 * Step 3: Authenticate user in AWS Cognito to receive ID & Access tokens.
 */
export async function loginInCognito(payload: LoginPayload): Promise<{
  tokens?: AuthTokens;
  challenge?: any;
}> {
  if (!clientId) {
    throw new CognitoClientError('Cognito Client ID is not configured.', 'ConfigError', 500);
  }

  const cleanEmail = payload.email.trim().toLowerCase();
  const secretHash = await computeSecretHash(cleanEmail);

  const authParameters: Record<string, string> = {
    USERNAME: cleanEmail,
    PASSWORD: payload.password
  };

  if (secretHash) {
    authParameters.SECRET_HASH = secretHash;
  }

  const input: InitiateAuthCommandInput = {
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    ClientId: clientId,
    AuthParameters: authParameters
  };

  try {
    const command = new InitiateAuthCommand(input);
    const response = await client.send(command);

    if (response.ChallengeName) {
      return {
        challenge: {
          challengeName: response.ChallengeName,
          session: response.Session,
          challengeParameters: response.ChallengeParameters
        }
      };
    }

    if (response.AuthenticationResult) {
      const tokens: AuthTokens = {
        accessToken: response.AuthenticationResult.AccessToken || '',
        idToken: response.AuthenticationResult.IdToken || '',
        refreshToken: response.AuthenticationResult.RefreshToken || '',
        expiresIn: response.AuthenticationResult.ExpiresIn || 3600
      };

      return { tokens };
    }

    throw new CognitoClientError('Cognito authentication did not return tokens.', 'AuthFailed', 500);
  } catch (error: any) {
    handleCognitoError(error);
  }
}

export interface RespondChallengeParams {
  email: string;
  challengeName: string;
  session: string;
  otp: string;
}

/**
 * Step 3b: Respond to Cognito authentication challenge (EMAIL_OTP / SMS_MFA) with OTP code.
 */
export async function respondToAuthChallengeInCognito(params: RespondChallengeParams): Promise<AuthTokens> {
  if (!clientId) {
    throw new CognitoClientError('Cognito Client ID is not configured.', 'ConfigError', 500);
  }

  const cleanEmail = params.email.trim().toLowerCase();
  const secretHash = await computeSecretHash(cleanEmail);

  const challengeResponses: Record<string, string> = {
    USERNAME: cleanEmail
  };

  if (secretHash) {
    challengeResponses.SECRET_HASH = secretHash;
  }

  const challenge = params.challengeName.toUpperCase();
  if (challenge === 'EMAIL_OTP') {
    challengeResponses.EMAIL_OTP_CODE = params.otp.trim();
  } else if (challenge === 'SMS_MFA') {
    challengeResponses.SMS_MFA_CODE = params.otp.trim();
  } else if (challenge === 'SOFTWARE_TOKEN_MFA') {
    challengeResponses.SOFTWARE_TOKEN_MFA_CODE = params.otp.trim();
  } else if (challenge === 'CUSTOM_CHALLENGE') {
    challengeResponses.ANSWER = params.otp.trim();
  } else {
    challengeResponses.EMAIL_OTP_CODE = params.otp.trim();
    challengeResponses.ANSWER = params.otp.trim();
  }

  const input: RespondToAuthChallengeCommandInput = {
    ClientId: clientId,
    ChallengeName: params.challengeName as any,
    Session: params.session,
    ChallengeResponses: challengeResponses
  };

  try {
    const command = new RespondToAuthChallengeCommand(input);
    const response = await client.send(command);

    if (response.AuthenticationResult) {
      return {
        accessToken: response.AuthenticationResult.AccessToken || '',
        idToken: response.AuthenticationResult.IdToken || '',
        refreshToken: response.AuthenticationResult.RefreshToken || '',
        expiresIn: response.AuthenticationResult.ExpiresIn || 3600
      };
    }

    throw new CognitoClientError('Cognito challenge verification did not return tokens.', 'ChallengeFailed', 400);
  } catch (error: any) {
    handleCognitoError(error);
  }
}

/**
 * Resend OTP code from AWS Cognito.
 */
export async function resendOtpInCognito(email: string): Promise<boolean> {
  if (!clientId) {
    throw new CognitoClientError('Cognito Client ID is not configured.', 'ConfigError', 500);
  }

  const cleanEmail = email.trim().toLowerCase();
  const secretHash = await computeSecretHash(cleanEmail);

  const input: ResendConfirmationCodeCommandInput = {
    ClientId: clientId,
    Username: cleanEmail,
    SecretHash: secretHash
  };

  try {
    const command = new ResendConfirmationCodeCommand(input);
    await client.send(command);
    return true;
  } catch (error: any) {
    handleCognitoError(error);
  }
}

/**
 * Initiate Forgot Password with AWS Cognito.
 */
export async function forgotPasswordInCognito(payload: ForgotPasswordPayload): Promise<boolean> {
  if (!clientId) {
    throw new CognitoClientError('Cognito Client ID is not configured.', 'ConfigError', 500);
  }

  const cleanEmail = payload.email.trim().toLowerCase();
  const secretHash = await computeSecretHash(cleanEmail);

  const input: ForgotPasswordCommandInput = {
    ClientId: clientId,
    Username: cleanEmail,
    SecretHash: secretHash
  };

  try {
    const command = new ForgotPasswordCommand(input);
    await client.send(command);
    return true;
  } catch (error: any) {
    handleCognitoError(error);
  }
}

/**
 * Confirm Password Reset with AWS Cognito.
 */
export async function resetPasswordInCognito(payload: ResetPasswordPayload): Promise<boolean> {
  if (!clientId) {
    throw new CognitoClientError('Cognito Client ID is not configured.', 'ConfigError', 500);
  }

  const cleanEmail = payload.email.trim().toLowerCase();
  const secretHash = await computeSecretHash(cleanEmail);

  const input: ConfirmForgotPasswordCommandInput = {
    ClientId: clientId,
    Username: cleanEmail,
    ConfirmationCode: payload.otp || '',
    Password: payload.newPassword,
    SecretHash: secretHash
  };

  try {
    const command = new ConfirmForgotPasswordCommand(input);
    await client.send(command);
    return true;
  } catch (error: any) {
    handleCognitoError(error);
  }
}

export const cognitoClient = {
  signUpInCognito,
  confirmSignUpInCognito,
  loginInCognito,
  respondToAuthChallengeInCognito,
  resendOtpInCognito,
  forgotPasswordInCognito,
  resetPasswordInCognito
};

export default cognitoClient;
