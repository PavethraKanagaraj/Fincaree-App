import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* ============================================================
   App split — one codebase, two deployments.
   APP_MODE=b2b  → only B2B routes are served
   APP_MODE=b2c  → only B2C routes are served
   unset         → everything is served (local development)
   ============================================================ */

const B2B_ROUTES = [
  "/home",
  "/leads",
  "/client-profile",
  "/meetings",
  "/reports",
  "/content-management",
];

const B2C_ROUTES = [
  "/customer-home",
  "/goals",
  "/spending",
  "/financial-summary",
  "/assets",
  "/risk",
];

const matches = (pathname: string, routes: string[]) =>
  routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

export function proxy(request: NextRequest) {
  const mode = process.env.APP_MODE;
  if (mode !== "b2b" && mode !== "b2c") return NextResponse.next();

  const { pathname } = request.nextUrl;
  const otherRoutes = mode === "b2c" ? B2B_ROUTES : B2C_ROUTES;
  const home = mode === "b2c" ? "/customer-home" : "/home";

  if (pathname === "/" || matches(pathname, otherRoutes)) {
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next.js internals and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp|css|js)$).*)"],
};
