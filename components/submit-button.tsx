"use client";

import { cn } from "@/lib/utils";
import { useFormStatus } from "react-dom";

interface SpinnerProps {
  visible: boolean;
  size?: "sm" | "md";
}

const Spinner = ({ visible, size }: SpinnerProps) => (
  <div
    className={cn(
      size === "sm" ? "h-5 w-5 border-2" : "h-6 w-6 border-[3px]",
      visible
        ? "animate-spin rounded-full border-solid border-white/80 border-t-transparent"
        : "border-transparent",
    )}
  ></div>
);

interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md";
}

export default function SubmitButton({
  size = "md",
  className,
  children,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      aria-disabled={pending}
      aria-busy={pending}
      className={cn(
        "rounded-lg text-white font-semibold border-0 inline-flex items-center justify-center",
        size === "sm"
          ? "gap-x-1.5 py-2 px-2.5 text-base"
          : "gap-x-3 py-2 px-4 text-lg",
        "shadow hover:shadow-md active:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 disabled:pointer-events-none",
        "transition-colors ease-in-out duration-150",
        "bg-violet-500 hover:bg-violet-600 active:bg-violet-700 shadow-violet-500/20 hover:shadow-violet-500/20  focus-visible:ring-violet-300 active:shadow-violet-500/20 disabled:bg-violet-300",
        className,
      )}
      {...props}
    >
      <Spinner visible={pending} size={size} />
      {children}
      <Spinner visible={false} size={size} />
    </button>
  );
}
