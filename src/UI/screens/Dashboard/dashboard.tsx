import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  LogOut,
  GraduationCap,
  Award,
  ShieldCheck,
  CheckCircle2,
  Key,
  Calendar,
  Mail,
  User
} from 'lucide-react';
import { authService } from '../../../services/AuthService/authService';
import { Card } from '../../reusables/base/Card/Card';
import { Button } from '../../reusables/base/Button/Button';

export const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const tokens = authService.getTokens();
  const [showTokens, setShowTokens] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await authService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F97316] text-white flex items-center justify-center shadow-xs">
              <BookOpen size={18} strokeWidth={2.4} />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg text-neutral-900">
                Project A
              </span>
              <span className="ml-2 text-xs font-semibold text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded-full border border-[#FFEDD5]">
                Learning Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-600 bg-neutral-100/70 px-3 py-1.5 rounded-full border border-neutral-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Cognito Authenticated</span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              isLoading={isLoggingOut}
              leftIcon={<LogOut size={14} />}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-[#EA580C] text-white rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full mb-3 text-orange-50">
              <CheckCircle2 size={13} />
              <span>Identity Verified via AWS Cognito Flow</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Welcome, {user?.name || 'Learner'}!
            </h1>
            <p className="text-orange-100 text-sm leading-relaxed">
              Your authentication session is active. You have full access to learning modules,
              courses, and role-based permissions on Project A.
            </p>
          </div>
        </div>

        {/* User Profile & Role Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-2">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center">
                  <User size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900">User Profile</h2>
                  <p className="text-xs text-neutral-500">Stored attributes & claims</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-[#EA580C] border border-orange-200/80">
                {user?.role === 'tutor' ? <Award size={13} /> : <GraduationCap size={13} />}
                <span className="capitalize">{user?.role || 'Student'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                <p className="text-neutral-400 font-medium mb-1">Full Name</p>
                <p className="text-sm font-semibold text-neutral-800">{user?.name || 'N/A'}</p>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                <p className="text-neutral-400 font-medium mb-1 flex items-center gap-1">
                  <Mail size={12} /> Email Address
                </p>
                <p className="text-sm font-semibold text-neutral-800 truncate">{user?.email || 'N/A'}</p>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                <p className="text-neutral-400 font-medium mb-1">Phone Number</p>
                <p className="text-sm font-semibold text-neutral-800">
                  {user?.countryCode || ''} {user?.phoneNumber || 'Not provided'}
                </p>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                <p className="text-neutral-400 font-medium mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Joined
                </p>
                <p className="text-sm font-semibold text-neutral-800">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
                </p>
              </div>

              {user?.certificationId && (
                <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-200/80 sm:col-span-2">
                  <p className="text-[#EA580C] font-medium mb-1 flex items-center gap-1">
                    <Award size={13} /> Tutor Certification ID
                  </p>
                  <p className="text-sm font-mono font-bold text-neutral-900">{user.certificationId}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Architecture Status Card */}
          <Card>
            <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 mb-5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900">Security & Layer</h2>
                <p className="text-xs text-neutral-500">MVVM + Auth Service</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-lg">
                <span className="text-neutral-600">UI / View Layer:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">Decoupled</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-lg">
                <span className="text-neutral-600">ViewModel (MVVM):</span>
                <span className="font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">Reactive</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-lg">
                <span className="text-neutral-600">Auth Service:</span>
                <span className="font-semibold text-[#EA580C] bg-orange-100/70 px-2 py-0.5 rounded">Cognito Ready</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-lg">
                <span className="text-neutral-600">MFA / OTP Flow:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">Passed</span>
              </div>
            </div>

            <Button
              variant="soft"
              size="sm"
              fullWidth
              className="mt-5"
              onClick={() => setShowTokens(!showTokens)}
              leftIcon={<Key size={14} />}
            >
              {showTokens ? 'Hide Session Tokens' : 'Inspect Tokens'}
            </Button>
          </Card>
        </div>

        {/* Tokens Drawer if toggled */}
        {showTokens && (
          <Card className="animate-fadeIn">
            <h3 className="text-sm font-bold text-neutral-900 mb-2 flex items-center gap-1.5">
              <Key size={15} className="text-[#F97316]" />
              <span>JWT Authentication Tokens (Decoupled Auth Service Layer)</span>
            </h3>
            <p className="text-xs text-neutral-500 mb-3">
              These tokens are injected into all HTTP requests by <code className="text-neutral-700 font-mono">api.client.ts</code>.
            </p>
            <pre className="p-3 bg-neutral-900 text-neutral-200 rounded-xl text-[11px] font-mono overflow-x-auto">
              {JSON.stringify(tokens, null, 2)}
            </pre>
          </Card>
        )}
      </main>
    </div>
  );
};
