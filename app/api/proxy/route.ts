import { NextRequest, NextResponse } from "next/server";

const PHP_BASE =
  process.env.PHP_API_URL || "https://pcpartpicker.whf.bz/api";

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

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
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

    // Build clean backend URL
    const targetUrl = new URL(`${PHP_BASE}/${path}`);

    // Copy all query params except "path"
    url.searchParams.forEach((value, key) => {
      if (key !== "path") {
        targetUrl.searchParams.append(key, value);
      }
    });

    console.log("➡️ Proxying to:", targetUrl.toString());

    // Forward headers safely
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    const auth = req.headers.get("authorization");
    if (auth) headers.set("Authorization", auth);

    // Forward body if needed
    let body: string | undefined;

    if (req.method !== "GET") {
      body = await req.text();
    }

    const response = await fetch(targetUrl.toString(), {
      method: req.method,
      headers,
      body,
    });

    const text = await response.text();

    console.log("⬅️ Backend status:", response.status);
    console.log("⬅️ Backend response preview:", text.slice(0, 200));

    // Try JSON parse
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: response.status });
    } catch {
      return NextResponse.json(
        {
          error: "Backend did not return JSON",
          preview: text.slice(0, 200),
        },
        { status: 502 }
      );
    }
  } catch (err: any) {
    console.error("🔥Proxy crash:", err);

    return NextResponse.json(
      {
        error: "Proxy crashed",
        message: err?.message || "unknown error",
      },
      { status: 500 }
    );
  }
}