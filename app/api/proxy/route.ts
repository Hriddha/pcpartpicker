import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // 🔥 IMPORTANT FIX

export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}

export async function PUT(req: NextRequest) {
  return handler(req);
}

export async function DELETE(req: NextRequest) {
  return handler(req);
}

async function handler(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const path = url.searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "Missing path" },
        { status: 400 }
      );
    }

    const base = process.env.PHP_API_URL || "https://pcpartpicker.whf.bz/api";

    const target = new URL(`${base}/${path}`);

    // copy query params safely
    url.searchParams.forEach((value, key) => {
      if (key !== "path") {
        target.searchParams.append(key, value);
      }
    });

    console.log("➡️ TARGET:", target.toString());

    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    const auth = req.headers.get("authorization");
    if (auth) headers.set("Authorization", auth);

    let body: string | undefined;

    if (req.method !== "GET") {
      body = await req.text();
    }

    const res = await fetch(target.toString(), {
      method: req.method,
      headers,
      body,
    });

    const text = await res.text();

    console.log("⬅️ STATUS:", res.status);
    console.log("⬅️ RESPONSE:", text.slice(0, 200));

    try {
      return NextResponse.json(JSON.parse(text), {
        status: res.status,
      });
    } catch {
      return NextResponse.json(
        {
          error: "Backend not JSON",
          preview: text.slice(0, 200),
        },
        { status: 502 }
      );
    }
  } catch (err: any) {
    console.error("🔥 PROXY CRASH:", err);

    return NextResponse.json(
      {
        error: "Proxy crashed",
        message: err?.message,
      },
      { status: 500 }
    );
  }
}