import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, FileBadge } from 'lucide-react';
import { useSignupViewModel } from './signup.vm';
import { AuthLayout } from '../../reusables/feature/AuthLayout/AuthLayout';
import { AuthTabs } from '../../reusables/feature/AuthTabs/AuthTabs';
import { Input } from '../../reusables/base/Input/Input';
import { PasswordInput } from '../../reusables/base/PasswordInput/PasswordInput';
import { Checkbox } from '../../reusables/base/Checkbox/Checkbox';
import { Button } from '../../reusables/base/Button/Button';
import { Alert } from '../../reusables/base/Alert/Alert';
import { CountryCodeSelect } from '../../reusables/feature/CountryCodeSelect/CountryCodeSelect';
import { PasswordValidation } from '../../reusables/feature/PasswordValidation/PasswordValidation';

export const SignupScreen: React.FC = () => {
  const vm = useSignupViewModel();

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join the next-generation learning community as a Student or certified Tutor."
      badgeText={vm.form.role === 'student' ? 'Student Enrollment' : 'Tutor Onboarding'}
      cardMaxWidth="compact"
      footerContent={
        <p className="text-neutral-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-[#F97316] font-semibold hover:text-[#EA580C] hover:underline ml-1"
          >
            Sign in
          </Link>
        </p>
      }
    >
      {/* Role Selection Tabs */}
      <AuthTabs activeTab={vm.form.role} onTabChange={vm.setRole} />

      {/* General Error Banner */}
      {vm.generalError && <Alert type="error" message={vm.generalError} />}

      <form onSubmit={vm.handleSignup} className="flex flex-col gap-3 sm:gap-3.5" noValidate>
        {/* Full Name */}
        <Input
          id="signup-name"
          label="Full Name"
          inputSize="sm"
          required
          placeholder="e.g. Alex Morgan"
          value={vm.form.name}
          onChange={(e) => vm.updateField('name', e.target.value)}
          error={vm.fieldErrors.name}
          leftIcon={<User size={16} />}
          disabled={vm.isLoading}
        />

        {/* Email Address */}
        <Input
          id="signup-email"
          type="email"
          label="Email Address"
          inputSize="sm"
          required
          placeholder="alex.morgan@example.com"
          value={vm.form.email}
          onChange={(e) => vm.updateField('email', e.target.value)}
          error={vm.fieldErrors.email}
          leftIcon={<Mail size={16} />}
          disabled={vm.isLoading}
        />

        {/* Phone Number with Country Code */}
        <div className="flex flex-col">
          <label
            htmlFor="signup-phone"
            className="block text-[11px] sm:text-xs font-semibold text-neutral-800 mb-1 tracking-tight"
          >
            Phone Number <span className="text-[#F97316] font-bold">*</span>
          </label>
          <div className="flex">
            <CountryCodeSelect
              value={vm.form.countryCode}
              onChange={(val) => vm.updateField('countryCode', val)}
              size="sm"
              disabled={vm.isLoading}
            />
            <div className="flex-1 relative">
              <input
                id="signup-phone"
                type="tel"
                placeholder="9876543210"
                value={vm.form.phoneNumber}
                onChange={(e) => vm.updateField('phoneNumber', e.target.value)}
                disabled={vm.isLoading}
                className={`w-full h-10 pl-3 pr-8 py-2 text-xs sm:text-sm text-neutral-900 bg-white border rounded-r-lg outline-none transition-all ${
                  vm.fieldErrors.phoneNumber
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-neutral-200 hover:border-neutral-300 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20'
                } disabled:bg-neutral-50 disabled:cursor-not-allowed`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                <Phone size={15} />
              </span>
            </div>
          </div>
          {vm.fieldErrors.phoneNumber && (
            <p className="text-xs text-red-500 mt-1 font-medium" role="alert">
              {vm.fieldErrors.phoneNumber}
            </p>
          )}
        </div>

        {/* Tutor Certification ID - Only visible when Tutor tab is selected */}
        {vm.form.role === 'tutor' && (
          <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-200/70">
            <Input
              id="signup-certification"
              label="Certification ID"
              inputSize="sm"
              required
              placeholder="e.g. CERT-EDU-9942"
              value={vm.form.certificationId}
              onChange={(e) => vm.updateField('certificationId', e.target.value)}
              error={vm.fieldErrors.certificationId}
              hint="Required for accredited instructor verification on Project A"
              leftIcon={<FileBadge size={16} />}
              disabled={vm.isLoading}
            />
          </div>
        )}

        {/* Password */}
        <PasswordInput
          id="signup-password"
          label="Password"
          inputSize="sm"
          required
          placeholder="Create a strong password"
          value={vm.form.password}
          onChange={(e) => vm.updateField('password', e.target.value)}
          error={vm.fieldErrors.password}
          leftIcon={<Lock size={16} />}
          disabled={vm.isLoading}
        />

        {/* Confirm Password */}
        <PasswordInput
          id="signup-confirm-password"
          label="Confirm Password"
          inputSize="sm"
          required
          placeholder="Re-enter your password"
          value={vm.form.confirmPassword}
          onChange={(e) => vm.updateField('confirmPassword', e.target.value)}
          error={vm.fieldErrors.confirmPassword}
          leftIcon={<Lock size={16} />}
          disabled={vm.isLoading}
        />

        {/* Dynamic visual password validation */}
        <PasswordValidation
          rules={vm.passwordRules}
          hasTyped={vm.hasTypedPassword || Boolean(vm.form.password)}
          showMatchRule={Boolean(vm.form.confirmPassword)}
        />

        {/* Terms & Conditions Checkbox */}
        <div className="pt-0.5">
          <Checkbox
            id="signup-terms"
            checked={vm.form.termsAccepted}
            onChange={(e) => vm.updateField('termsAccepted', e.target.checked)}
            disabled={vm.isLoading}
            error={vm.fieldErrors.termsAccepted}
            label={
              <span className="text-xs">
                I agree to the{' '}
                <a
                  href="#terms"
                  onClick={(e) => e.preventDefault()}
                  className="text-[#F97316] font-semibold hover:underline"
                >
                  Terms & Conditions
                </a>{' '}
                and{' '}
                <a
                  href="#privacy"
                  onClick={(e) => e.preventDefault()}
                  className="text-[#F97316] font-semibold hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </span>
            }
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          isLoading={vm.isLoading}
          className="mt-1 h-10 text-sm font-semibold"
        >
          Sign Up
        </Button>
      </form>
    </AuthLayout>
  );
};
