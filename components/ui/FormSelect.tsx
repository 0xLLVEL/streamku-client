import React from 'react';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export function FormSelect({ label, error, options, className = '', ...props }: FormSelectProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-white/60 block">{label}</label>
      <select
        className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all appearance-none ${error ? 'border-red-500/50' : ''}`}
        {...props}
      >
        <option value="" disabled className="bg-neutral-900 text-white/50">Select {label.toLowerCase()}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-neutral-900 text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
