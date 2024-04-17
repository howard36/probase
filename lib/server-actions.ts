export type ActionResponse<T = never> = { ok: true, data: T } | { ok: false, error: { message: string } };

export function error(message: string): ActionResponse {
  return {
    ok: false,
    error: {
      message,
    },
  };
}

// Takes in an async server action, and returns a synchronous version of that action (with extra error logging)
export function wrapAction<T extends unknown[], U>(asyncAction: (...args: T) => Promise<ActionResponse<U>>, onSuccess?: (data: U) => void): (...args: T) => void {
  const syncAction = (...args: T) => {
    (async () => {
      const resp = await asyncAction(...args);
      if (resp.ok) {
        if (onSuccess) {
          onSuccess(resp.data);
        }
      } else {
        console.error("Server action returned error: ", resp.error.message)
      }
    })().catch((err) => console.error(err));
  }
  return syncAction;
}
