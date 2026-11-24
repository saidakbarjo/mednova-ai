import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, dashboardPath, verifySession } from "@/lib/session";

/**
 * Edge middleware — first line of defence for pages:
 *  • /dashboard/**  requires a valid session
 *  • /dashboard/<role>/** only for that role (admins cannot open patient pages etc.)
 *  • /login & /register bounce signed-in users to their dashboard
 * API routes do their own (stronger, DB-backed) checks in requireUser().
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (pathname === "/dashboard") return NextResponse.redirect(new URL(dashboardPath(session.role), req.url));
    const area = pathname.split("/")[2];
    if (["patient", "doctor", "admin"].includes(area) && area !== session.role) {
      return NextResponse.redirect(new URL(dashboardPath(session.role), req.url));
    }
  }
  if ((pathname === "/login" || pathname === "/register") && session) {
    return NextResponse.redirect(new URL(dashboardPath(session.role), req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/login", "/register"] };
