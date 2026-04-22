import { NextRequest, NextResponse } from 'next/server';

const PHP_BASE =
  process.env.PHP_API_URL || 'https://pcpartpicker.whf.bz/api';

export async function GET(req: NextRequest) {
  return proxyRequest(req);
}

export async function POST(req: NextRequest) {
  return proxyRequest(req);
}

export async function PUT(req: NextRequest) {
  return proxyRequest(req);
}

export async function DELETE(req: NextRequest) {
  return proxyRequest(req);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

async function proxyRequest(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const path = searchParams.get('path');
    if (!path) {
      return NextResponse.json(
        { error: 'Missing path parameter' },
        { status: 400 }
      );
    }

    // Remove "path" and keep everything else
    const filteredParams = new URLSearchParams(searchParams);
    filteredParams.delete('path');

    // Build clean target URL
    const targetUrl = new URL(`${PHP_BASE}/${path}`);

    filteredParams.forEach((value, key) => {
      targetUrl.searchParams.append(key, value);
    });

    // Build headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    headers.set('X-Requested-With', 'XMLHttpRequest');
    headers.set(
      'User-Agent',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
    );

    // Forward auth header
    const auth = request.headers.get('authorization');
    if (auth) headers.set('Authorization', auth);

    const options: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.method !== 'GET') {
      options.body = await request.text();
    }

    const response = await fetch(targetUrl.toString(), options);
    const text = await response.text();

    // Try JSON parse
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: response.status });
    } catch {
      console.error('❌ Non-JSON response from PHP:', text.slice(0, 300));

      return NextResponse.json(
        {
          error: 'Invalid JSON response from backend',
          preview: text.slice(0, 200),
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error('❌ Proxy error:', error);

    return NextResponse.json(
      {
        error: 'Proxy failed',
        message: error?.message || 'unknown error',
      },
      { status: 500 }
    );
  }
}