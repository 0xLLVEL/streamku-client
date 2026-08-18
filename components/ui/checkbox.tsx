import * as React from "react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center justify-center cursor-pointer">
        <input
          type="checkbox"
          className="peer sr-only"
          ref={ref}
          {...props}
        />
        <div className={cn(
          "w-4 h-4 rounded border border-white/20 bg-transparent flex items-center justify-center transition-all",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-red-600 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#0A0A0A]",
          "peer-checked:bg-red-600 peer-checked:border-red-600",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          className
        )}>
          <svg
            className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
