import { clsx } from "clsx"

export default function Spinner({ size = "md", className }: { size?: "sm" | "md" | "lg", className?: string }) {
    const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" }
    return (
        <div className={clsx("animate-spin rounded-full border-2 border-slate-200 border-t-brand-600", sizes[size], className)} />
    )
}