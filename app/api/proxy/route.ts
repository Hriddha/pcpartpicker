import { NextRequest, NextResponse } from "next/server";

const PHP_BASE =
  process.env.PHP_API_URL || "https://pcpartpicker.whf.bz/api";

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function PUT(req: NextRequest) {
  return handle(req);
}

export async function DELETE(req: NextRequest) {
  return handle(req);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

async function handle(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const path = url.searchParams.get("path");
    if (!path) {
      return NextResponse.json(
        { error: "Missing path" },
        { status: 400 }
      );
    }

    // Build backend URL (SAFE)
    const targetUrl = new URL(`${PHP_BASE}/${path}`);

    // Copy all query params except "path"
    url.searchParams.forEach((value, key) => {
      if (key !== "path") {
        targetUrl.searchParams.set(key, value);
      }
    });

    console.log("➡️ REQUEST:", targetUrl.toString());

    // Build headers
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    const auth = req.headers.get("authorization");
    if (auth) headers.set("Authorization", auth);

    // SAFE BODY HANDLING (IMPORTANT FIX)
    let body: string | undefined;

    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await req.text();
    }

    const res = await fetch(targetUrl.toString(), {
      method: req.method,
      headers,
      body,
    });

    const text = await res.text();

    console.log("⬅️ STATUS:", res.status);
    console.log("⬅️ RESPONSE:", text.slice(0, 200));

    return NextResponse.json(
      safeJson(text),
      { status: res.status }
    );

  } catch (err: any) {
    console.error("🔥 PROXY ERROR:", err);

    return NextResponse.json(
      {
        error: "Proxy crashed",
        message: err?.message || "unknown",
      },
      { status: 500 }
    );
  }
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return {
      error: "Invalid JSON from backend",
      preview: text.slice(0, 200),
    };
  }
}