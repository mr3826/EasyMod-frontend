/**
 * LanguageSelector Component
 * Dropdown for selecting voice recording language with persistence
 */

import React, { useCallback } from 'react';
import { useLanguageSelection } from '../hooks/useVoiceRecorder';
import { LanguageSelectorProps, LANGUAGE_OPTIONS } from '../types';
import { ChevronDown } from 'lucide-react';

interface LanguageSelectorWithHookProps {
  onLanguageChange?: (lang: string) => void;
}

/**
 * Standalone component (with internal state)
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onChange,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value as any);
    },
    [onChange]
  );

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="language-select" className="text-sm font-medium text-gray-700">
        🌍 Recording Language
      </label>
      <div className="relative">
        <select
          id="language-select"
          value={currentLanguage}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg appearance-none text-gray-900 font-medium cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.flag} {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      <p className="text-xs text-gray-500">
        {currentLanguage === 'auto'
          ? 'Backend will detect language automatically'
          : `All recordings will be processed as ${LANGUAGE_OPTIONS.find((o) => o.value === currentLanguage)?.label}`}
      </p>
    </div>
  );
};

/**
 * Hook-based variant with localStorage persistence
 */
export const LanguageSelectorWithPersistence: React.FC<LanguageSelectorWithHookProps> = ({
  onLanguageChange,
}) => {
  const { selectedLanguage, setLanguage } = useLanguageSelection();

  const handleChange = useCallback(
    (lang) => {
      setLanguage(lang);
      onLanguageChange?.(lang);
    },
    [setLanguage, onLanguageChange]
  );

  return (
    <LanguageSelector currentLanguage={selectedLanguage} onChange={handleChange} />
  );
};

export default LanguageSelector;
