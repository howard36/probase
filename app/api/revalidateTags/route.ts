import { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'

export async function GET(request: NextRequest) {
  const tags = request.nextUrl.searchParams.getAll('tag');
  tags.forEach(tag => revalidateTag(tag));
  return new Response();
}