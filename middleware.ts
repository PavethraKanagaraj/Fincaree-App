import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const B2B_ROUTES = [
  "/home",
  "/leads",
  "/meetings",
  "/reports",
  "/client-profile",
  "/content-management",
];

const B2C_ROUTES = [
  "/customer-home",
  "/assets",
  "/financial-summary",
  "/goals",
  "/risk",
  "/spending",
];

export function middleware(request: NextRequest) {
  const appType = process.env.APP_TYPE;
  const { pathname } = request.nextUrl;

  if (!appType) return NextResponse.next();

  const isB2B = B2B_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const isB2C = B2C_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  if (appType === "b2b" && isB2C) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (appType === "b2c" && isB2B) {
    return NextResponse.redirect(new URL("/customer-home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
