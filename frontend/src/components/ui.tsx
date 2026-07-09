import clsx from "clsx";
import type React from "react";
import { ReactNode } from "react";
import { priorityTone } from "../utils/format";
import { X } from "lucide-react";

export function Card({ children, className, ...props }: React.HTMLAttributes<HTMLElement> & { children: ReactNode; className?: string }) {
  return <section className={clsx("glass-card rounded-xl transition duration-200 hover:border-[#2f464d]", className)} {...props}>{children}</section>;
}

export function Button({ children, variant = "primary", className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  return (
    <button
      className={clsx(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-current transition duration-200 disabled:opacity-50 [&_svg]:shrink-0 [&_svg]:stroke-current",
        variant === "primary" && "bg-[#00f58a] text-[#04100a] shadow-[0_0_26px_rgba(0,245,138,.25)] hover:bg-[#33ffa4]",
        variant === "secondary" && "border border-[#1e2a2f] bg-[#0b0f12] text-[#f5f7fa] hover:border-[#00f58a]/50 hover:bg-[#0f1716]",
        variant === "ghost" && "text-[#9ca3af] hover:bg-[#11171b] hover:text-white",
        variant === "danger" && "bg-[#ff4d4d]/15 text-[#ff6b6b] ring-1 ring-[#ff4d4d]/30 hover:bg-[#ff4d4d]/25",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="h-11 rounded-lg border border-[#1e2a2f] bg-[#0b0f12] px-4 text-sm text-white outline-none transition placeholder:text-[#6b7280] focus:border-[#00f58a]/70 focus:ring-4 focus:ring-[#00f58a]/10" {...props} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="h-11 rounded-lg border border-[#1e2a2f] bg-[#0b0f12] px-4 text-sm text-white outline-none transition focus:border-[#00f58a]/70 focus:ring-4 focus:ring-[#00f58a]/10" {...props} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="rounded-lg border border-[#1e2a2f] bg-[#0b0f12] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#6b7280] focus:border-[#00f58a]/70 focus:ring-4 focus:ring-[#00f58a]/10" {...props} />;
}

export function Badge({ children, tone = "default", className }: { children: ReactNode; tone?: "default" | "success" | "danger" | "warning" | "blue" | "purple" | "muted"; className?: string }) {
  const tones = {
    default: "bg-[#11171b] text-[#d1d5db] ring-[#26343a]",
    success: "bg-[#063d28] text-[#00f58a] ring-[#00f58a]/25",
    danger: "bg-[#3c1215] text-[#ff6b6b] ring-[#ff4d4d]/25",
    warning: "bg-[#3d2c06] text-[#f5b642] ring-[#f5b642]/25",
    blue: "bg-[#0b2448] text-[#60a5fa] ring-[#3b82f6]/25",
    purple: "bg-[#2b1648] text-[#c084fc] ring-[#a855f7]/25",
    muted: "bg-[#151b20] text-[#8b949e] ring-[#26343a]"
  };
  return <span className={clsx("inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1", tones[tone], className)}>{children}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const labels: Record<string, string> = { baixa: "Baixa", media: "Media", alta: "Alta", urgente: "Urgente" };
  return <Badge tone={priorityTone(priority)}>{labels[priority] ?? priority}</Badge>;
}

export function Avatar({ name, src, className }: { name: string; src?: string; className?: string }) {
  return (
    <div className={clsx("grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-[#1e2a2f] bg-[#11171b] text-sm font-black text-[#00f58a]", className)}>
      {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return <div className="h-2 rounded-full bg-[#182025]"><div className="h-2 rounded-full bg-[#00f58a] shadow-[0_0_16px_rgba(0,245,138,.45)]" style={{ width: `${value}%` }} /></div>;
}

export function StatCard({ title, value, detail, icon, tone = "success" }: { title: string; value: string | number; detail: string; icon: ReactNode; tone?: "success" | "danger" | "blue" | "warning" }) {
  return (
    <Card className="p-5 hover:-translate-y-0.5">
      <div className="mb-6 flex items-center gap-3">
        <div className={clsx("grid h-11 w-11 place-items-center rounded-lg", tone === "success" && "bg-[#063d28] text-[#00f58a]", tone === "danger" && "bg-[#3c1215] text-[#ff4d4d]", tone === "blue" && "bg-[#0b2448] text-[#60a5fa]", tone === "warning" && "bg-[#3d2c06] text-[#f5b642]")}>{icon}</div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <p className="text-4xl font-black tracking-tight text-white">{value}</p>
      <p className={clsx("mt-3 text-xs", tone === "danger" ? "text-[#ff6b6b]" : "text-[#00f58a]")}>{detail}</p>
    </Card>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-white">{title}</h2>{action}</div>;
}

export function Modal({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="glass-card max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-xl">
        <div className="flex items-center justify-between border-b border-[#1e2a2f] px-5 py-4">
          <h2 className="text-lg font-black">{title}</h2>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg border border-[#26343a] bg-[#0b0f12] text-[#f5f7fa] transition hover:border-[#00f58a]/60 hover:bg-[#11171b] hover:text-[#00f58a]"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>
        <div className="max-h-[78vh] overflow-y-auto p-5 thin-scroll">{children}</div>
      </div>
    </div>
  );
}
