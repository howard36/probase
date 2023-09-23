import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
 
export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get('tag')
  console.log("revalidating", tag);
  revalidateTag(tag as string)
  return NextResponse.json({ revalidated: true, now: Date.now() })
}