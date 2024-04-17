export type ActionResponse = { ok: true } | { ok: false, error: { message: string } };

export function error(message: string): ActionResponse {
  return {
    ok: false,
    error: {
      message,
    },
  };
}

// Takes in an async server action, and returns a synchronous version of that action (with extra error logging)
export function wrapAction<T extends unknown[]>(asyncAction: (...args: T) => Promise<ActionResponse>): (...args: T) => void {
  const syncAction = (...args: T) => {
    (async () => {
      const resp = await asyncAction(...args);
      if (!resp.ok) {
        console.error("Server action returned error: ", resp.error.message)
      }
    })().catch((err) => console.error(err));
  }
  return syncAction;
}
