import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import type { CountryCodeOption } from '../../../../types/authTypes';

export interface ExtendedCountryCodeOption extends CountryCodeOption {
  name: string;
}

export const COUNTRY_CODES: ExtendedCountryCodeOption[] = [
  { code: 'US', dialCode: '+1', name: 'United States', label: 'United States (+1)', flag: '🇺🇸' },
  { code: 'CA', dialCode: '+1', name: 'Canada', label: 'Canada (+1)', flag: '🇨🇦' },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom', label: 'United Kingdom (+44)', flag: '🇬🇧' },
  { code: 'IN', dialCode: '+91', name: 'India', label: 'India (+91)', flag: '🇮🇳' },
  { code: 'AU', dialCode: '+61', name: 'Australia', label: 'Australia (+61)', flag: '🇦🇺' },
  { code: 'DE', dialCode: '+49', name: 'Germany', label: 'Germany (+49)', flag: '🇩🇪' },
  { code: 'FR', dialCode: '+33', name: 'France', label: 'France (+33)', flag: '🇫🇷' },
  { code: 'SG', dialCode: '+65', name: 'Singapore', label: 'Singapore (+65)', flag: '🇸🇬' },
  { code: 'AE', dialCode: '+971', name: 'UAE', label: 'UAE (+971)', flag: '🇦🇪' },
  { code: 'SA', dialCode: '+966', name: 'Saudi Arabia', label: 'Saudi Arabia (+966)', flag: '🇸🇦' },
  { code: 'JP', dialCode: '+81', name: 'Japan', label: 'Japan (+81)', flag: '🇯🇵' },
  { code: 'CN', dialCode: '+86', name: 'China', label: 'China (+86)', flag: '🇨🇳' },
  { code: 'KR', dialCode: '+82', name: 'South Korea', label: 'South Korea (+82)', flag: '🇰🇷' },
  { code: 'BR', dialCode: '+55', name: 'Brazil', label: 'Brazil (+55)', flag: '🇧🇷' },
  { code: 'MX', dialCode: '+52', name: 'Mexico', label: 'Mexico (+52)', flag: '🇲🇽' },
  { code: 'ES', dialCode: '+34', name: 'Spain', label: 'Spain (+34)', flag: '🇪🇸' },
  { code: 'IT', dialCode: '+39', name: 'Italy', label: 'Italy (+39)', flag: '🇮🇹' },
  { code: 'NL', dialCode: '+31', name: 'Netherlands', label: 'Netherlands (+31)', flag: '🇳🇱' },
  { code: 'CH', dialCode: '+41', name: 'Switzerland', label: 'Switzerland (+41)', flag: '🇨🇭' },
  { code: 'SE', dialCode: '+46', name: 'Sweden', label: 'Sweden (+46)', flag: '🇸🇪' },
  { code: 'IE', dialCode: '+353', name: 'Ireland', label: 'Ireland (+353)', flag: '🇮🇪' },
  { code: 'NZ', dialCode: '+64', name: 'New Zealand', label: 'New Zealand (+64)', flag: '🇳🇿' },
  { code: 'ZA', dialCode: '+27', name: 'South Africa', label: 'South Africa (+27)', flag: '🇿🇦' },
  { code: 'NG', dialCode: '+234', name: 'Nigeria', label: 'Nigeria (+234)', flag: '🇳🇬' },
  { code: 'EG', dialCode: '+20', name: 'Egypt', label: 'Egypt (+20)', flag: '🇪🇬' },
  { code: 'KE', dialCode: '+254', name: 'Kenya', label: 'Kenya (+254)', flag: '🇰🇪' },
  { code: 'PK', dialCode: '+92', name: 'Pakistan', label: 'Pakistan (+92)', flag: '🇵🇰' },
  { code: 'BD', dialCode: '+880', name: 'Bangladesh', label: 'Bangladesh (+880)', flag: '🇧🇩' },
  { code: 'ID', dialCode: '+62', name: 'Indonesia', label: 'Indonesia (+62)', flag: '🇮🇩' },
  { code: 'MY', dialCode: '+60', name: 'Malaysia', label: 'Malaysia (+60)', flag: '🇲🇾' },
  { code: 'PH', dialCode: '+63', name: 'Philippines', label: 'Philippines (+63)', flag: '🇵🇭' },
  { code: 'VN', dialCode: '+84', name: 'Vietnam', label: 'Vietnam (+84)', flag: '🇻🇳' },
  { code: 'TR', dialCode: '+90', name: 'Turkey', label: 'Turkey (+90)', flag: '🇹🇷' },
];

export interface CountryCodeSelectProps {
  value: string;
  onChange: (dialCode: string, country?: ExtendedCountryCodeOption) => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({
  value,
  onChange,
  size = 'md',
  disabled = false,
  className = '',
  id = 'country-code-select'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Match selected country based on dialCode
  const selectedCountry = useMemo(() => {
    return COUNTRY_CODES.find((c) => c.dialCode === value) || COUNTRY_CODES[0];
  }, [value]);

  // Filter countries by query (name, code, or dialCode)
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRY_CODES;
    const q = searchQuery.toLowerCase().trim().replace(/^\+/, '');
    return COUNTRY_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.replace(/^\+/, '').includes(q)
    );
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handlePointerDown);
    }
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (country: ExtendedCountryCodeOption) => {
    onChange(country.dialCode, country);
    setIsOpen(false);
  };

  const isSm = size === 'sm';

  return (
    <div ref={containerRef} className={`relative shrink-0 ${className}`}>
      {/* Clean Trigger Button: simply shows flag and dialCode (e.g. 🇺🇸 +1) */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Country code: ${selectedCountry.name} (${selectedCountry.dialCode})`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
        className={`flex items-center gap-1.5 ${
          isSm ? 'h-10 px-2.5 text-xs sm:text-sm' : 'h-11 px-3 text-sm'
        } bg-white hover:bg-neutral-50 border border-neutral-200 border-r-0 rounded-l-lg font-medium text-neutral-800 transition-colors select-none cursor-pointer outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 active:outline-none ${
          disabled ? 'opacity-60 bg-neutral-50 cursor-not-allowed' : ''
        } ${isOpen ? 'bg-neutral-50 border-neutral-300' : ''}`}
      >
        <span className="text-base leading-none select-none">{selectedCountry.flag}</span>
        <span className="font-semibold text-neutral-800">{selectedCountry.dialCode}</span>
        <ChevronDown
          size={13}
          className={`text-neutral-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-neutral-600' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Popover */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Country Code Selection"
          className="absolute left-0 top-[calc(100%+4px)] z-50 w-64 sm:w-72 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Search Box */}
          <div className="px-2.5 pb-1.5 pt-0.5 border-b border-neutral-100">
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-2.5 text-neutral-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or code..."
                className="w-full h-8 pl-8 pr-3 bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-200 rounded-lg text-xs text-neutral-800 placeholder:text-neutral-400 outline-none focus:outline-none focus:border-[#F97316] transition-colors"
              />
            </div>
          </div>

          {/* Countries List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-neutral-50 py-1">
            {filteredCountries.length === 0 ? (
              <div className="py-4 px-3 text-center text-xs text-neutral-400">
                No matching countries found
              </div>
            ) : (
              filteredCountries.map((country) => {
                const isSelected = country.dialCode === selectedCountry.dialCode && country.code === selectedCountry.code;

                return (
                  <button
                    key={`${country.code}-${country.dialCode}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(country)}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors outline-none focus:outline-none focus-visible:outline-none ring-0 select-none cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50/80 text-neutral-900 font-semibold'
                        : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="text-base leading-none shrink-0">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`font-mono text-[11px] ${
                          isSelected ? 'text-[#EA580C] font-semibold' : 'text-neutral-500'
                        }`}
                      >
                        {country.dialCode}
                      </span>
                      {isSelected && <Check size={13} className="text-[#EA580C]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
