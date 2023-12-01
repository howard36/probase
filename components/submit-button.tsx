interface SubmitButtonProps {
  isSubmitting: boolean;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
}

const Spinner = () => (
  <div
    className="h-6 w-6 animate-spin rounded-full border-[3px] border-solid border-sky-100 border-t-transparent "
  ></div>
);

export default function SubmitButton({
  isSubmitting,
  children,
  type = "submit",
}: SubmitButtonProps) {
  return (
    <button
      type={type}
      disabled={isSubmitting}
      aria-disabled={isSubmitting}
      aria-busy={isSubmitting}
      className="w-48 py-2 rounded-lg text-lg text-white font-semibold border-0 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 shadow shadow-sky-500/20 hover:shadow-md hover:shadow-sky-500/20 active:shadow active:shadow-sky-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 transition ease-in-out duration-150 flex flex-auto items-center justify-center gap-x-3"
    >
      {isSubmitting && <Spinner />}
      {children}
    </button>
  );
}
