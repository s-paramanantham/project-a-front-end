import React from 'react';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useResetPasswordViewModel } from './reset-password.vm';
import { AuthLayout } from '../../reusables/feature/AuthLayout/AuthLayout';
import { PasswordInput } from '../../reusables/base/PasswordInput/PasswordInput';
import { Button } from '../../reusables/base/Button/Button';
import { Alert } from '../../reusables/base/Alert/Alert';
import { PasswordValidation } from '../../reusables/feature/PasswordValidation/PasswordValidation';

export const ResetPasswordScreen: React.FC = () => {
  const vm = useResetPasswordViewModel();

  return (
    <AuthLayout
      title="Create new password"
      subtitle={`Choose a strong, secure password for ${vm.email}`}
      badgeText="Security Center"
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
      {/* Success Banner */}
      {vm.successMessage && <Alert type="success" message={vm.successMessage} />}

      {/* General Error Banner */}
      {vm.generalError && <Alert type="error" message={vm.generalError} />}

      <form onSubmit={vm.handleResetPassword} className="flex flex-col gap-4" noValidate>
        {/* New Password */}
        <PasswordInput
          id="reset-new-password"
          label="New Password"
          required
          placeholder="Enter new password"
          value={vm.newPassword}
          onChange={(e) => vm.updateNewPassword(e.target.value)}
          error={vm.fieldErrors.newPassword}
          leftIcon={<Lock size={18} />}
          disabled={vm.isLoading || Boolean(vm.successMessage)}
          autoFocus
        />

        {/* Confirm Password */}
        <PasswordInput
          id="reset-confirm-password"
          label="Confirm New Password"
          required
          placeholder="Re-enter new password"
          value={vm.confirmPassword}
          onChange={(e) => vm.updateConfirmPassword(e.target.value)}
          error={vm.fieldErrors.confirmPassword}
          leftIcon={<Lock size={18} />}
          disabled={vm.isLoading || Boolean(vm.successMessage)}
        />

        {/* Dynamic visual password validation */}
        <PasswordValidation
          rules={vm.passwordRules}
          hasTyped={vm.hasTypedPassword || Boolean(vm.newPassword)}
          showMatchRule={Boolean(vm.confirmPassword)}
        />

        {/* Reset Password Button */}
        <Button
          type="submit"
          id="btn-reset-password-submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={vm.isLoading}
          disabled={Boolean(vm.successMessage)}
          leftIcon={<CheckCircle2 size={16} />}
          className="mt-2"
        >
          Reset Password
        </Button>
      </form>
    </AuthLayout>
  );
};
