import { NextResponse, type NextRequest } from "next/server";
import { clearAuthCookiesOnResponse } from "@/lib/auth/clear-auth-cookies";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { validateAccessToken } from "@/lib/auth/validate-session";

const LOGIN_PATH = "/login";

function safeNextPath(value: string | null): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  if (value.startsWith(LOGIN_PATH)) return "/";
  return value;
}

function redirectToLogin(
  request: NextRequest,
  pathname: string,
  options?: { clearCookie?: boolean; unauthorized?: boolean },
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = LOGIN_PATH;
  url.search = "";
  if (pathname !== "/") {
    url.searchParams.set("next", pathname);
  }
  if (options?.unauthorized) {
    url.searchParams.set("type", "unauthorized");
  }
  const response = NextResponse.redirect(url);
  if (options?.clearCookie) {
    clearAuthCookiesOnResponse(response);
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value?.trim();
  const hasToken = Boolean(token && token.length > 0);
  const isLogin = pathname === LOGIN_PATH;

  if (!hasToken) {
    if (isLogin) return NextResponse.next();
    return redirectToLogin(request, pathname);
  }

  const isValid = await validateAccessToken(token!);
  if (!isValid) {
    if (isLogin) {
      const response = NextResponse.next();
      clearAuthCookiesOnResponse(response);
      return response;
    }
    return redirectToLogin(request, pathname, {
      clearCookie: true,
      unauthorized: true,
    });
  }

  if (isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = safeNextPath(request.nextUrl.searchParams.get("next"));
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
