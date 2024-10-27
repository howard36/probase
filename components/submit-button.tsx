"use client";

import { cn } from "@/lib/utils";
import { useFormStatus } from "react-dom";
import { FC } from "react";
interface SpinnerProps {
  visible: boolean;
  size?: "sm" | "md";
}

const Spinner: FC<SpinnerProps> = ({ visible, size = "md" }) => (
  <div
    className={cn({
      "h-5 w-5 border-2": size === "sm",
      "h-6 w-6 border-[3px]": size === "md",
      "animate-spin rounded-full border-solid border-white/80 border-t-transparent":
        visible,
      "border-transparent": !visible,
    })}
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
        "inline-flex items-center justify-center rounded-lg border-0 font-semibold text-white",
        {
          "gap-x-1.5 px-2.5 py-2 text-base": size === "sm",
          "gap-x-3 px-4 py-2 text-lg": size === "md",
        },
        "shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 active:shadow disabled:pointer-events-none",
        "transition-colors duration-150 ease-in-out",
        "bg-violet-500 shadow-violet-500/20 hover:bg-violet-600 hover:shadow-violet-500/20 focus-visible:ring-violet-300 active:bg-violet-700 active:shadow-violet-500/20 disabled:bg-violet-300",
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
