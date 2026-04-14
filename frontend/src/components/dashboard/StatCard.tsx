"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  className?: string;
  color?: "brand" | "blue" | "purple" | "emerald" | "amber";
}

const colorStyles = {
  brand: "bg-brand-50 text-brand-600 border-brand-100",
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
};

const iconBackgrounds = {
  brand: "bg-brand-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
};

export default function StatCard({ 
  title, 
  value, 
  icon, 
  description, 
  trend,
  className,
  color = "brand"
}: StatCardProps) {
  return (
    <div className={cn("card-hover p-6 flex flex-col gap-4", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
        </div>
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
          iconBackgrounds[color]
        )}>
          {icon}
        </div>
      </div>
      
      {(description || trend) && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
          {trend && (
            <span className={cn(
              "text-xs font-bold px-1.5 py-0.5 rounded-md",
              trend.isUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            )}>
              {trend.isUp ? "+" : "-"}{trend.value}
            </span>
          )}
          {description && <p className="text-xs text-slate-500 font-medium">{description}</p>}
        </div>
      )}
    </div>
  );
}
