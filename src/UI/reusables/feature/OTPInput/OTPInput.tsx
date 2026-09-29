import React, { useRef, useEffect } from 'react';

export interface OTPInputProps {
  value: string;
  length?: number;
  onChange: (otp: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
  idPrefix?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  length = 6,
  onChange,
  disabled = false,
  hasError = false,
  className = '',
  idPrefix = 'otp-digit'
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split into individual digits
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    // Auto focus first input on mount if empty
    if (!value && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Keep only numeric characters
    const numericChars = rawVal.replace(/\D/g, '');

    if (!numericChars) {
      // Clear current digit
      const nextDigits = [...digits];
      nextDigits[index] = '';
      onChange(nextDigits.join(''));
      return;
    }

    if (numericChars.length > 1) {
      // Pasted or multiple digits entered
      handlePasteString(numericChars, index);
      return;
    }

    // Single digit entered
    const digit = numericChars.slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    const nextOtp = nextDigits.join('');
    onChange(nextOtp);

    // Auto-advance to next input
    if (index < length - 1 && digit) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current is already empty, move to previous and clear it
        inputRefs.current[index - 1]?.focus();
        const nextDigits = [...digits];
        nextDigits[index - 1] = '';
        onChange(nextDigits.join(''));
        e.preventDefault();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePasteString = (pastedText: string, startIndex = 0) => {
    const cleanNumbers = pastedText.replace(/\D/g, '').slice(0, length - startIndex);
    if (!cleanNumbers) return;

    const nextDigits = [...digits];
    for (let i = 0; i < cleanNumbers.length; i++) {
      if (startIndex + i < length) {
        nextDigits[startIndex + i] = cleanNumbers[i];
      }
    }
    const nextOtp = nextDigits.join('');
    onChange(nextOtp);

    // Focus target input after paste
    const nextFocusIndex = Math.min(startIndex + cleanNumbers.length, length - 1);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    handlePasteString(pastedData, 0);
  };

  return (
    <div
      className={`flex items-center justify-center gap-2 sm:gap-3 ${className}`}
      role="group"
      aria-label="6-digit verification code"
    >
      {Array.from({ length }).map((_, index) => {
        const inputId = `${idPrefix}-${index}`;
        const isCurrent = digits[index] !== '';

        return (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            id={inputId}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digits[index]}
            disabled={disabled}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            aria-label={`Digit ${index + 1}`}
            className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl font-bold bg-white rounded-xl border transition-all duration-150 outline-none ${
              hasError
                ? 'border-red-500 text-red-600 bg-red-50/20 focus:ring-3 focus:ring-red-500/20'
                : isCurrent
                ? 'border-[#F97316] text-neutral-900 bg-orange-50/10'
                : 'border-neutral-200 text-neutral-800 hover:border-neutral-300'
            } focus:border-[#F97316] focus:ring-3 focus:ring-[#F97316]/20 disabled:bg-neutral-50 disabled:cursor-not-allowed`}
          />
        );
      })}
    </div>
  );
};
