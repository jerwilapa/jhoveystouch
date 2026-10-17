import { NextRequest, NextResponse } from "next/server";
import {
  clearAdminSessionCookie,
  createAdminSession,
  hasValidAdminSession,
  setAdminSessionCookie,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      { authenticated: hasValidAdminSession(request) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Admin sign-in is not configured:", error);
    return NextResponse.json(
      { message: "Admin sign-in is not configured on the server." },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Please enter your admin password." }, { status: 400 });
  }

  const password =
    typeof body === "object" &&
    body !== null &&
    "password" in body &&
    typeof body.password === "string"
      ? body.password
      : "";
  if (!password || password.length > 1024) {
    return NextResponse.json({ message: "Please enter your admin password." }, { status: 400 });
  }

  try {
    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ message: "The password is incorrect." }, { status: 401 });
    }

    const response = NextResponse.json(
      { authenticated: true },
      { headers: { "Cache-Control": "no-store" } },
    );
    setAdminSessionCookie(response, createAdminSession());
    return response;
  } catch (error) {
    console.error("Unable to create admin session:", error);
    return NextResponse.json(
      { message: "Admin sign-in is not configured on the server." },
      { status: 503 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json(
    { authenticated: false },
    { headers: { "Cache-Control": "no-store" } },
  );
  clearAdminSessionCookie(response);
  return response;
}
