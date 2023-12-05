export function error(message: string) {
  return {
    ok: false,
    error: {
      message,
    }
  }
}
