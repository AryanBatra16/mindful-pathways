import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { BackgroundBlobs } from "@/components/BackgroundBlobs";
import type { ReactNode } from "react";

export function AuthShell({ title, subtitle, children, footer, onSubmit }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode; onSubmit?: (e: React.FormEvent) => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <BackgroundBlobs />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md glass rounded-3xl p-8 shadow-glow"
      >
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="h-10 w-10 rounded-xl gradient-primary shadow-glow flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gradient">Mind2Care</span>
        </Link>
        <h1 className="text-2xl font-bold text-center">{title}</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">{subtitle}</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">{children}</form>
        {footer && <div className="mt-6 text-sm text-center text-muted-foreground">{footer}</div>}
      </motion.div>
    </div>
  );
}

export function AuthInput({ label, type = "text", placeholder, value, onChange, required }: { label: string; type?: string; placeholder?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1.5 w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all"
      />
    </label>
  );
}

export function AuthButton({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full py-3 rounded-xl gradient-primary text-white font-semibold shadow-glow hover:scale-[1.02] transition-transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
