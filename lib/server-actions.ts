import { notifyError } from "@/lib/toast";

export type ActionResponseOk<T = undefined> = T extends undefined
  ? { ok: true }
  : { ok: true; data: T };
export type ActionResponseError = { ok: false; error: { message: string } };
export type ActionResponse<T = undefined> =
  ActionResponseOk<T> | ActionResponseError;

export function error(message: string): ActionResponseError {
  return {
    ok: false,
    error: {
      message,
    },
  };
}

export const UNEXPECTED_ERROR_MESSAGE =
  "Something went wrong. Please try again.";

/**
 * For the catch block of a server action. Logs the real error on the server
 * (Vercel captures console output) and returns a generic message that is safe
 * to show to the user. Raw errors can contain query text and constraint names.
 */
export function unexpectedError(
  action: string,
  err: unknown,
): ActionResponseError {
  console.error(`Unexpected error in ${action}:`, err);
  return error(UNEXPECTED_ERROR_MESSAGE);
}

/**
 * Calls a server action from the client and shows its error, if any, as a
 * toast. Resolves with the response so the caller can react to failure (for
 * example by reopening an editor). Resolves with `undefined` after a redirect:
 * Next.js resolves redirecting actions with no value on the client
 * (https://github.com/vercel/next.js/issues/50659), and the redirect still
 * happens.
 */
export function runAction<T extends unknown[], U>(
  asyncAction: (...args: T) => Promise<ActionResponse<U>>,
): (...args: T) => Promise<ActionResponse<U> | undefined> {
  return async (...args: T) => {
    let resp: ActionResponse<U> | undefined;
    try {
      resp = await asyncAction(...args);
    } catch (err) {
      console.error(err);
      notifyError(UNEXPECTED_ERROR_MESSAGE);
      return error(UNEXPECTED_ERROR_MESSAGE);
    }
    if (resp === undefined) {
      console.warn("Response is undefined after a redirect");
      return undefined;
    }
    if (!resp.ok) {
      console.error("Server action returned error: ", resp.error.message);
      notifyError(resp.error.message);
    }
    return resp;
  };
}

// Takes in an async server action, and returns a synchronous version of that action. The resulting function is called from the client. Errors are shown as a toast; pass onError to also undo optimistic UI.
export function wrapAction<T extends unknown[], U>(
  asyncAction: (...args: T) => Promise<ActionResponse<U>>,
  onSuccess?: (resp: ActionResponseOk<U>) => void,
  onError?: (resp: ActionResponseError) => void,
): (...args: T) => void {
  const run = runAction(asyncAction);
  const syncAction = (...args: T) => {
    run(...args)
      .then((resp) => {
        if (resp === undefined) {
          return;
        }
        if (resp.ok) {
          onSuccess?.(resp);
        } else {
          onError?.(resp);
        }
      })
      .catch((err) => console.error(err));
  };
  return syncAction;
}
