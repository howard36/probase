import { cn } from "@/utils/utils";

interface SubmitButtonProps {
  isSubmitting: boolean;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const Spinner = () => (
  <div
    className="h-6 w-6 animate-spin rounded-full border-[3px] border-solid border-white/80 border-t-transparent"
  ></div>
);

export default function SubmitButton({
  isSubmitting,
  children,
  type = "submit",
  className
}: SubmitButtonProps) {
  return (
    <button
      type={type}
      disabled={isSubmitting}
      aria-disabled={isSubmitting}
      aria-busy={isSubmitting}
      className={cn("w-40 py-2 rounded-lg text-lg text-white font-semibold border-0 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 shadow shadow-sky-500/20 hover:shadow-md hover:shadow-sky-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 active:shadow active:shadow-sky-500/20 disabled:bg-sky-300 disabled:pointer-events-none disabled:cursor-progress transition-colors ease-in-out duration-150 flex flex-auto items-center justify-center gap-x-3", className)}
    >
      {isSubmitting && <Spinner />}
      {children}
    </button>
  );
}
