export type ActionResponseOk<T = undefined> = T extends undefined
  ? { ok: true }
  : { ok: true; data: T };
export type ActionResponseError = { ok: false; error: { message: string } };
export type ActionResponse<T = undefined> =
  | ActionResponseOk<T>
  | ActionResponseError;

export function error(message: string): ActionResponseError {
  return {
    ok: false,
    error: {
      message,
    },
  };
}

// Takes in an async server action, and returns a synchronous version of that action (with extra error logging). The resulting function is called from the client.
export function wrapAction<T extends unknown[], U>(
  asyncAction: (...args: T) => Promise<ActionResponse<U>>,
  onSuccess?: (resp: ActionResponseOk<U>) => void,
): (...args: T) => void {
  const syncAction = (...args: T) => {
    (async () => {
      const resp = await asyncAction(...args);
      if (resp === undefined) {
        console.warn("Response is undefined after a redirect");
        // This is a bug in Next.js
        // See https://github.com/vercel/next.js/issues/50659
        // The redirect still works, so there's no need to do anything else
        return;
      }
      if (resp.ok) {
        if (onSuccess) {
          onSuccess(resp);
        }
      } else {
        console.error("Server action returned error: ", resp.error.message);
      }
    })().catch((err) => console.error(err));
  };
  return syncAction;
}
