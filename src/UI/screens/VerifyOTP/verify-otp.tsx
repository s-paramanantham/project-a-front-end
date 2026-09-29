import React from 'react';
import { Mail, Edit3, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { useVerifyOtpViewModel } from './verify-otp.vm';
import { AuthLayout } from '../../reusables/feature/AuthLayout/AuthLayout';
import { OTPInput } from '../../reusables/feature/OTPInput/OTPInput';
import { Button } from '../../reusables/base/Button/Button';
import { Alert } from '../../reusables/base/Alert/Alert';
import { Input } from '../../reusables/base/Input/Input';

export const VerifyOTPScreen: React.FC = () => {
  const vm = useVerifyOtpViewModel();

  return (
    <AuthLayout
      title={vm.purposeTitle}
      subtitle="Enter the 6-digit code we dispatched to verify your credentials."
      badgeText="Security Verification"
      cardMaxWidth="sm"
      footerContent={
        <button
          type="button"
          onClick={vm.navigateToLogin}
          className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-neutral-800 text-xs font-medium transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Login</span>
        </button>
      }
    >
      {/* Alert Messages */}
      {vm.errorMessage && <Alert type="error" message={vm.errorMessage} />}
      {vm.infoMessage && <Alert type="info" message={vm.infoMessage} />}

      {/* Target Email Box */}
      <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 mb-6 text-center">
        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#F97316]">
          <Mail size={18} />
        </div>
        <p className="text-xs text-neutral-500 font-medium">Verification code sent to</p>

        {!vm.isEditingEmail ? (
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-sm font-semibold text-neutral-900 break-all">
              {vm.email}
            </span>
            <button
              type="button"
              id="btn-change-email"
              onClick={() => vm.setIsEditingEmail(true)}
              className="text-[#F97316] hover:text-[#EA580C] p-1 rounded hover:bg-orange-100/50 transition-colors"
              title="Change email"
              aria-label="Change email"
            >
              <Edit3 size={14} />
            </button>
          </div>
        ) : (
          <div className="mt-2.5 flex items-center gap-2">
            <Input
              id="edit-email-input"
              type="email"
              value={vm.tempEmail}
              onChange={(e) => vm.setTempEmail(e.target.value)}
              placeholder="Enter correct email"
              className="h-9 text-xs"
              autoFocus
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={vm.handleSaveEmail}
              leftIcon={<CheckCircle size={14} />}
            >
              Update
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={vm.handleVerify} className="flex flex-col gap-6" noValidate>
        {/* 6-Digit OTP Input */}
        <div>
          <label className="block text-center text-xs font-semibold text-neutral-700 mb-3 uppercase tracking-wider">
            Enter 6-Digit Code
          </label>
          <OTPInput
            value={vm.otp}
            onChange={vm.handleOtpChange}
            hasError={Boolean(vm.errorMessage)}
            disabled={vm.isLoading}
          />
        </div>

        {/* Resend Section & Countdown Timer */}
        <div className="text-center text-xs text-neutral-500 flex flex-col items-center gap-1.5">
          <p>Didn't receive the verification code?</p>
          {vm.countdown > 0 ? (
            <span className="font-mono text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-neutral-200">
              Resend code in {vm.countdown}s
            </span>
          ) : (
            <button
              type="button"
              id="btn-resend-otp"
              onClick={vm.handleResend}
              disabled={vm.isResending}
              className="inline-flex items-center gap-1 text-[#F97316] font-semibold hover:text-[#EA580C] hover:underline cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={12} className={vm.isResending ? 'animate-spin' : ''} />
              <span>Resend OTP</span>
            </button>
          )}
        </div>

        {/* Verify Button */}
        <Button
          type="submit"
          id="btn-verify-otp"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={vm.isLoading}
          disabled={vm.otp.length < 6}
        >
          Verify OTP
        </Button>
      </form>
    </AuthLayout>
  );
};
