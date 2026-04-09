"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  variant?: "default" | "danger" | "brand";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  variant = "default"
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_25px_80px_-15px_rgba(0,0,0,0.3)] border border-white/20 overflow-hidden transform transition-all animate-slide-up">
        {/* Header decoration */}
        <div className={cn(
          "absolute top-0 inset-x-0 h-1.5",
          variant === 'danger' ? "bg-red-500" : variant === 'brand' ? "bg-brand-500" : "bg-slate-200"
        )} />

        <div className="p-8 sm:p-10">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3">
                {variant === 'danger' && <AlertTriangle size={24} className="text-red-500" />}
                {title}
              </h3>
              {description && (
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-8">
            {children}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row-reverse gap-3">
            {footer || (
              <>
                <Button 
                  onClick={onClose}
                  variant={variant === 'danger' ? 'primary' : 'primary'}
                  className={cn(
                    variant === 'danger' && "bg-red-600 hover:bg-red-700 shadow-red-200"
                  )}
                >
                  Confirm
                </Button>
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
