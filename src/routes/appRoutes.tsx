import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SignupScreen } from '../UI/screens/Signup/signup';
import { LoginScreen } from '../UI/screens/Login/login';
import { VerifyOTPScreen } from '../UI/screens/VerifyOTP/verify-otp';
import { ForgotPasswordScreen } from '../UI/screens/ForgotPassword/forgot-password';
import { ResetPasswordScreen } from '../UI/screens/ResetPassword/reset-password';
import { DashboardScreen } from '../UI/screens/Dashboard/dashboard';
import { authService } from '../services/AuthService/authService';
import { ErrorBoundary } from '../UI/reusables/base/ErrorBoundary/ErrorBoundary';

/**
 * Protected Route wrapper ensuring users are authenticated
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Root redirect */}
        <Route
          path="/"
          element={
            authService.isAuthenticated() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Authentication screens required by specifications */}
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/verify-otp" element={<VerifyOTPScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/reset-password" element={<ResetPasswordScreen />} />

        {/* Post-Authentication Learning Platform Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardScreen />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};
