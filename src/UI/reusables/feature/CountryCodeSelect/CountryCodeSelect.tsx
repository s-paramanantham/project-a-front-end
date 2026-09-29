import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { CountryCodeOption } from '../../../../types/authTypes';

export const COUNTRY_CODES: CountryCodeOption[] = [
  { code: 'US', dialCode: '+1', label: 'United States (+1)', flag: '🇺🇸' },
  { code: 'CA', dialCode: '+1', label: 'Canada (+1)', flag: '🇨🇦' },
  { code: 'GB', dialCode: '+44', label: 'United Kingdom (+44)', flag: '🇬🇧' },
  { code: 'IN', dialCode: '+91', label: 'India (+91)', flag: '🇮🇳' },
  { code: 'AU', dialCode: '+61', label: 'Australia (+61)', flag: '🇦🇺' },
  { code: 'DE', dialCode: '+49', label: 'Germany (+49)', flag: '🇩🇪' },
  { code: 'FR', dialCode: '+33', label: 'France (+33)', flag: '🇫🇷' },
  { code: 'SG', dialCode: '+65', label: 'Singapore (+65)', flag: '🇸🇬' },
  { code: 'AE', dialCode: '+971', label: 'UAE (+971)', flag: '🇦🇪' },
  { code: 'JP', dialCode: '+81', label: 'Japan (+81)', flag: '🇯🇵' },
];

export interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({
  value,
  onChange,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`relative flex items-center shrink-0 ${className}`}>
      <select
        id="country-code-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label="Select Country Code"
        className="h-11 pl-3 pr-7 bg-white border border-neutral-200 border-r-0 rounded-l-lg text-sm text-neutral-800 font-medium appearance-none focus:outline-none focus:border-[#F97316] focus:z-10 cursor-pointer disabled:bg-neutral-50 disabled:cursor-not-allowed"
      >
        {COUNTRY_CODES.map((country) => (
          <option key={`${country.code}-${country.dialCode}`} value={country.dialCode}>
            {country.flag} {country.dialCode} ({country.code})
          </option>
        ))}
      </select>
      <span className="absolute right-2 pointer-events-none text-neutral-400">
        <ChevronDown size={14} />
      </span>
    </div>
  );
};
