import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SignupScreen } from '../UI/screens/Signup/signup';
import { LoginScreen } from '../UI/screens/Login/login';
import { VerifyOTPScreen } from '../UI/screens/VerifyOTP/verify-otp';
import { ForgotPasswordScreen } from '../UI/screens/ForgotPassword/forgot-password';
import { ResetPasswordScreen } from '../UI/screens/ResetPassword/reset-password';
import { DashboardScreen } from '../UI/screens/Dashboard/dashboard';
import { CoursesScreen } from '../UI/screens/Courses/courses';
import { StudyScreen } from '../UI/screens/Study/StudyScreen';
import { ProfileSettingsScreen } from '../UI/screens/ProfileSettings/ProfileSettingsScreen';
import { CreateCourseScreen } from '../UI/screens/Tutor/CreateCourseScreen';
import { ManageCourseScreen } from '../UI/screens/Tutor/ManageCourseScreen';
import { ReviewersScreen } from '../UI/screens/Reviewers/ReviewersScreen';
import { TutorStudentsScreen } from '../UI/screens/Tutor/TutorStudentsScreen';
import { TodoScreen } from '../UI/screens/Todo/TodoScreen';
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

        {/* Courses Catalog & Learning Paths */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <CoursesScreen />
            </ProtectedRoute>
          }
        />

        {/* Interactive Course Study & Lesson Curriculum */}
        <Route
          path="/courses/:courseId/study"
          element={
            <ProtectedRoute>
              <StudyScreen />
            </ProtectedRoute>
          }
        />

        {/* Student Reviewers & Mentorship */}
        <Route
          path="/reviewers"
          element={
            <ProtectedRoute>
              <ReviewersScreen />
            </ProtectedRoute>
          }
        />

        {/* Student Daily Todo & Study Schedule Planner */}
        <Route
          path="/todo"
          element={
            <ProtectedRoute>
              <TodoScreen />
            </ProtectedRoute>
          }
        />

        {/* Tutor Assigned Students Grid & Progress Details */}
        <Route
          path="/tutor/students"
          element={
            <ProtectedRoute>
              <TutorStudentsScreen />
            </ProtectedRoute>
          }
        />

        {/* Tutor Course Editing & Lesson Management */}
        <Route
          path="/tutor/courses/:courseId/edit"
          element={
            <ProtectedRoute>
              <ManageCourseScreen />
            </ProtectedRoute>
          }
        />

        {/* Profile Settings Dedicated Screen */}
        <Route
          path="/profile/settings"
          element={
            <ProtectedRoute>
              <ProfileSettingsScreen />
            </ProtectedRoute>
          }
        />

        {/* Tutor Course & Lessons Creation */}
        <Route
          path="/courses/create"
          element={
            <ProtectedRoute>
              <CreateCourseScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/courses/create"
          element={
            <ProtectedRoute>
              <CreateCourseScreen />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};
