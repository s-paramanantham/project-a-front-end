import React from 'react';
import { Mail, ArrowLeft, ArrowRight, KeyRound } from 'lucide-react';
import { useForgotPasswordViewModel } from './forgot-password.vm';
import { AuthLayout } from '../../reusables/feature/AuthLayout/AuthLayout';
import { Input } from '../../reusables/base/Input/Input';
import { Button } from '../../reusables/base/Button/Button';
import { Alert } from '../../reusables/base/Alert/Alert';

export const ForgotPasswordScreen: React.FC = () => {
  const vm = useForgotPasswordViewModel();

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email associated with your Project A account and we'll send a verification code."
      badgeText="Account Recovery"
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
      {/* General Error Banner */}
      {vm.generalError && <Alert type="error" message={vm.generalError} />}

      <form onSubmit={vm.handleContinue} className="flex flex-col gap-4" noValidate>
        <div className="w-12 h-12 mx-auto rounded-full bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#F97316] mb-1">
          <KeyRound size={22} />
        </div>

        <Input
          id="forgot-email"
          type="email"
          label="Account Email Address"
          required
          placeholder="your.email@example.com"
          value={vm.email}
          onChange={(e) => vm.updateEmail(e.target.value)}
          error={vm.emailError || undefined}
          leftIcon={<Mail size={18} />}
          disabled={vm.isLoading}
          autoFocus
          autoComplete="email"
        />

        <Button
          type="submit"
          id="btn-forgot-continue"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={vm.isLoading}
          rightIcon={<ArrowRight size={16} />}
          className="mt-2"
        >
          Continue
        </Button>
      </form>
    </AuthLayout>
  );
};
