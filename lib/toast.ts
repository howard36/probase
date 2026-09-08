// A minimal error-toast channel. Anything on the client can call
// notifyError(); the <Toaster /> in the root layout subscribes and renders.
// Kept free of React so lib/server-actions.ts can import it.

export type ToastListener = (message: string) => void;

let listener: ToastListener | null = null;

export function notifyError(message: string): void {
  if (listener !== null) {
    listener(message);
  }
}

/** Register the single renderer. Returns an unsubscribe function. */
export function subscribeToErrors(next: ToastListener): () => void {
  listener = next;
  return () => {
    if (listener === next) {
      listener = null;
    }
  };
}
