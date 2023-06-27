import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const token = req.nextauth.token;
    const url = new URL(req.url);
    const cid = url.pathname.split('/')[2];

    if (token?.viewColPerms.includes(cid)) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect("/unauthorized");
    }
  }
)

export const config = { matcher: ["/c/:path*"] }
