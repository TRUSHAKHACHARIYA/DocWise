import { clsx } from "clsx"

interface BadgeProps {
    variant?: "default" | "success" | "warning" | "danger" | "info" | "purple"
    children: React.ReactNode
    className?: string
}

const variants = {
    default: "bg-[var(--cream)] text-[var(--ink-muted)]",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    purple: "bg-brand-100 text-brand-700",
}

export default function Badge({ variant = "default", children, className }: BadgeProps) {
    return (
        <span className={clsx("badge", variants[variant], className)}>
            {children}
        </span>
    )
}
