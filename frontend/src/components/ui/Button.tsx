import { forwardRef } from "react"
import { clsx } from "clsx"
import { Loader2 } from "lucide-react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger" | "outline"
    size?: "sm" | "md" | "lg"
    loading?: boolean
    icon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = "primary", size = "md", loading, icon, children, className, disabled, ...props }, ref) => {
        const variants = {
            primary: "btn-primary",
            secondary: "btn-secondary",
            ghost: "btn-ghost",
            outline: "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[rgba(26,24,20,0.14)] text-[var(--ink)] bg-[var(--warm-white)] hover:bg-[var(--cream)] focus:outline-none focus:ring-2 focus:ring-[rgba(196,71,30,0.18)] transition-all",
            danger: "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-150",
        }

        const sizes = {
            sm: "px-3 py-1.5 text-xs",
            md: "",
            lg: "px-6 py-3 text-base",
        }

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={clsx(variants[variant], sizes[size], className)}
                {...props}
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
                {children}
            </button>
        )
    }
)

Button.displayName = "Button"
export { Button }
export default Button
