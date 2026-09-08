"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { subscribeToErrors } from "@/lib/toast";

const DISMISS_AFTER_MILLIS = 8_000;

interface Toast {
  id: number;
  message: string;
}

let nextId = 1;

/** Renders error toasts sent through notifyError(). Mount once, in the root layout. */
export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const unsubscribe = subscribeToErrors((message) => {
      const id = nextId++;
      setToasts((current) => [...current, { id, message }]);
      timers.push(setTimeout(() => dismiss(id), DISMISS_AFTER_MILLIS));
    });
    return () => {
      unsubscribe();
      timers.forEach(clearTimeout);
    };
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex w-80 max-w-[calc(100vw-3rem)] flex-col gap-3"
      aria-live="assertive"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 shadow-lg shadow-red-500/10"
        >
          <FontAwesomeIcon
            icon={faCircleExclamation}
            className="mt-0.5 text-red-500"
          />
          <p className="flex-grow">{toast.message}</p>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss"
            className="text-red-400 hover:text-red-600"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      ))}
    </div>
  );
}
