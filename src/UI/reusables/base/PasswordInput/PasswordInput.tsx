import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../Input/Input';
import type { InputProps } from '../Input/Input';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showToggle?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({
  showToggle = true,
  inputSize = 'md',
  ...rest
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const isSm = inputSize === 'sm';

  const toggleButton = showToggle ? (
    <button
      type="button"
      onClick={toggleVisibility}
      className="p-1 text-neutral-400 hover:text-[#EA580C] hover:bg-[#FFF7ED] rounded transition-colors outline-none focus:outline-none focus:ring-0 active:outline-none cursor-pointer"
      tabIndex={-1}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? (
        <EyeOff size={isSm ? 16 : 18} />
      ) : (
        <Eye size={isSm ? 16 : 18} />
      )}
    </button>
  ) : undefined;

  return (
    <Input
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      rightIcon={toggleButton}
      inputSize={inputSize}
      autoComplete="new-password"
      {...rest}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';
