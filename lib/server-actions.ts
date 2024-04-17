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

// Takes in an async server action, and returns a synchronous version of that action (with extra error logging)
export function wrapAction<T extends unknown[], U>(
  asyncAction: (...args: T) => Promise<ActionResponse<U>>,
  onSuccess?: (resp: ActionResponseOk<U>) => void,
): (...args: T) => void {
  const syncAction = (...args: T) => {
    (async () => {
      const resp = await asyncAction(...args);
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
