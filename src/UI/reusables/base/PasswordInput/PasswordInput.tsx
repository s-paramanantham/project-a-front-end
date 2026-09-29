import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../Input/Input';
import type { InputProps } from '../Input/Input';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showToggle?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({
  showToggle = true,
  ...rest
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleButton = showToggle ? (
    <button
      type="button"
      onClick={toggleVisibility}
      className="p-1 text-neutral-400 hover:text-[#EA580C] hover:bg-[#FFF7ED] rounded transition-colors"
      tabIndex={-1}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  ) : undefined;

  return (
    <Input
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      rightIcon={toggleButton}
      autoComplete="new-password"
      {...rest}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';
