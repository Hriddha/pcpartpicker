import { NextRequest, NextResponse } from 'next/server';

const PHP_BASE = (process.env.PHP_API_URL || 'https://pcpartpicker-production.up.railway.app').replace(/\/$/, '');


export async function GET(request: NextRequest) {
  return proxyRequest(request);
}
export async function POST(request: NextRequest) {
  return proxyRequest(request);
}
export async function PUT(request: NextRequest) {
  return proxyRequest(request);
}
export async function DELETE(request: NextRequest) {
  return proxyRequest(request);
}

async function proxyRequest(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '';
    searchParams.delete('path');
    const query = searchParams.toString();
    const targetUrl = `${PHP_BASE}/${path}${query ? '?' + query : ''}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Referer': 'https://pcpartpicker-eight.vercel.app/',
    };

    const auth = request.headers.get('Authorization');
    if (auth) headers['Authorization'] = auth;

    const options: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.method === 'POST' || request.method === 'PUT') {
      const body = await request.text();
      if (body) options.body = body;
    }

    const response = await fetch(targetUrl, options);
    const text = await response.text();

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: response.status });
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON response', raw: text.substring(0, 200) },
        { status: 500 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Proxy request failed', details: message },
      { status: 500 }
    );
  }
}