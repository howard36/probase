export function error(message: string): { ok: false, error: { message: string } } {
  return {
    ok: false,
    error: {
      message,
    }
  }
}
