import type {ButtonHTMLAttributes} from "react";
import {cn} from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({className, variant = "secondary", ...props}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-primary text-white hover:bg-blue-700",
        variant === "secondary" && "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
        variant === "ghost" && "text-slate-200 hover:bg-slate-800 hover:text-white",
        className
      )}
      {...props}
    />
  );
}
