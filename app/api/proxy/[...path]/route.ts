import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Use API_URL for server-side — more secure
// Falls back to NEXT_PUBLIC_API_URL if API_URL not set
const BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }, 
) {
  const cookieStore = await cookies(); 
  const token = (await cookieStore).get("auth_token")?.value;

  const { path } = await params;
  const { search } = new URL(req.url);
  const url = `${BASE_URL}/${path.join("/")}${search}`;

  const res = await fetch(url, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: req.method !== "GET" ? await req.text() : undefined,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
