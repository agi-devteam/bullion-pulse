import { NextResponse } from "next/server";
import { clearAuthCookiesOnResponse } from "@/lib/auth/clear-auth-cookies";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearAuthCookiesOnResponse(response);
  return response;
}
