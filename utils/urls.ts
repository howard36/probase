export function internal_api_url(path: string): string {
  return `${process.env.NEXTAUTH_URL}/api/internal/${path}?secret=${process.env.INTERNAL_API_KEY}`;
}
