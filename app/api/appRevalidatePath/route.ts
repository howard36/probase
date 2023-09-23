import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
 
export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  console.log({path})

  if (path !== null) {
    revalidatePath(path);
    return NextResponse.json({ revalidated: true });
  } else {
    return NextResponse.json({ revalidated: false });
  }
}
