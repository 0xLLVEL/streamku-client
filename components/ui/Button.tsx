import React from 'react';

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { isLoading?: boolean; variant?: 'primary' | 'glass' }>(
  ({ className, children, isLoading, variant = 'primary', ...props }, ref) => {
    
    const baseStyle = "relative w-full py-3 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";
    
    const variants = {
      primary: "text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] border border-white/20",
      glass: "liquid-glass text-white hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
    };

    return (
      <button
        ref={ref}
        className={`${baseStyle} ${variants[variant]} ${className || ''}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full blur-md mix-blend-overlay" />
        
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2 relative z-10">
            <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            <span>Processing...</span>
          </div>
        ) : (
          <span className="relative z-10 drop-shadow-md">{children}</span>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';
