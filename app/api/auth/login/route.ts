import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const res = await fetch(`${process.env.API_URL}/api/auth/login`, {
    //                                ↑
    //                       changed from NEXT_PUBLIC_API_URL to API_URL
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    if (!text) {
      return NextResponse.json(
        { message: "Server is waking up, please try again in a few seconds" },
        { status: 503 }
      );
    }

    const data = JSON.parse(text);

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Invalid credentials" },
        { status: res.status }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: data.message,
      user: {
        userId: data.data.userId,
        userName: data.data.userName,
        email: data.data.email,
        role: data.data.role,
      },
    });

    response.cookies.set("auth_token", data.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;

  } catch (error) {
    return NextResponse.json(
      { message: "Failed to connect to server, please try again" },
      { status: 500 }
    );
  }
}