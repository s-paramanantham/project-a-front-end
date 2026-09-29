/**
 * AWS Cognito Configuration
 *
 * Configured to read from Vite environment variables (VITE_AWS_*)
 * with development fallbacks. This enables plug-and-play connection
 * with an AWS Cognito User Pool or AWS Amplify Auth.
 */

export interface CognitoConfiguration {
  region: string;
  userPoolId: string;
  userPoolWebClientId: string;
  identityPoolId?: string;
  domain?: string;
  redirectSignIn?: string;
  redirectSignOut?: string;
  responseType?: 'code' | 'token';
  isConfigured: boolean;
}

export const cognitoConfig: CognitoConfiguration = {
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID || '',
  userPoolWebClientId: import.meta.env.VITE_AWS_CLIENT_ID || '',
  identityPoolId: import.meta.env.VITE_AWS_IDENTITY_POOL_ID || '',
  domain: import.meta.env.VITE_AWS_COGNITO_DOMAIN || '',
  redirectSignIn: import.meta.env.VITE_AUTH_REDIRECT_SIGN_IN || 'http://localhost:5173/dashboard',
  redirectSignOut: import.meta.env.VITE_AUTH_REDIRECT_SIGN_OUT || 'http://localhost:5173/login',
  responseType: 'code',
  get isConfigured(): boolean {
    return Boolean(this.userPoolId && this.userPoolWebClientId);
  }
};
