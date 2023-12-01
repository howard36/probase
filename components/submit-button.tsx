import { cn } from "@/utils/utils";

interface SpinnerProps {
  visible: boolean;
}

const Spinner = ({ visible }: SpinnerProps) => (
  <div
    className={cn("h-6 w-6", visible && "animate-spin rounded-full border-[3px] border-solid border-white/80 border-t-transparent")}
  ></div>
);

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting: boolean;
}

export default function SubmitButton({
  isSubmitting,
  className,
  children,
  ...props
}: SubmitButtonProps) {
  return (
    <button
      disabled={isSubmitting}
      aria-disabled={isSubmitting}
      aria-busy={isSubmitting}
      className={cn("py-2 px-4 rounded-lg text-lg text-white font-semibold border-0 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 shadow shadow-sky-500/20 hover:shadow-md hover:shadow-sky-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 active:shadow active:shadow-sky-500/20 disabled:bg-sky-300 disabled:pointer-events-none disabled:cursor-progress transition-colors ease-in-out duration-150 inline-flex items-center justify-center gap-x-3", className)}
      {...props}
    >
      <Spinner visible={isSubmitting} />
        {children}
      <Spinner visible={false} />
    </button>
  );
}
