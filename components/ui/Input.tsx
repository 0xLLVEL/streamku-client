import React from 'react';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-5 py-3 liquid-glass rounded-full outline-none text-white placeholder:text-white/50 focus:border-white/40 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 ${className || ''}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
