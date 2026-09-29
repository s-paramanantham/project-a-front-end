import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useLoginViewModel } from './login.vm';
import { AuthLayout } from '../../reusables/feature/AuthLayout/AuthLayout';
import { Input } from '../../reusables/base/Input/Input';
import { PasswordInput } from '../../reusables/base/PasswordInput/PasswordInput';
import { Button } from '../../reusables/base/Button/Button';
import { Alert } from '../../reusables/base/Alert/Alert';

export const LoginScreen: React.FC = () => {
  const vm = useLoginViewModel();

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Project A learning workspace."
      cardMaxWidth="sm"
      footerContent={
        <p className="text-neutral-500">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-[#F97316] font-semibold hover:text-[#EA580C] hover:underline ml-1"
          >
            Create account
          </Link>
        </p>
      }
    >
      {/* Error Banner */}
      {vm.errorMessage && <Alert type="error" message={vm.errorMessage} />}

      <form onSubmit={vm.handleLogin} className="flex flex-col gap-4" noValidate>
        {/* Email Field */}
        <Input
          id="login-email"
          type="email"
          label="Email Address"
          required
          placeholder="your.email@example.com"
          value={vm.form.email}
          onChange={(e) => vm.updateField('email', e.target.value)}
          error={vm.fieldErrors.email}
          leftIcon={<Mail size={18} />}
          disabled={vm.isLoading}
          autoComplete="email"
        />

        {/* Password Field */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className="text-xs font-semibold text-neutral-800 tracking-tight"
            >
              Password <span className="text-[#F97316] font-bold">*</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-[#F97316] hover:text-[#EA580C] font-semibold hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <PasswordInput
            id="login-password"
            placeholder="Enter your password"
            value={vm.form.password}
            onChange={(e) => vm.updateField('password', e.target.value)}
            error={vm.fieldErrors.password}
            leftIcon={<Lock size={18} />}
            disabled={vm.isLoading}
            autoComplete="current-password"
          />
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          id="btn-login-submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={vm.isLoading}
          rightIcon={<ArrowRight size={16} />}
          className="mt-2"
        >
          Sign In
        </Button>
      </form>
    </AuthLayout>
  );
};
