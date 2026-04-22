import { NextRequest, NextResponse } from 'next/server';

const PHP_BASE = process.env.PHP_API_URL || 'https://pcpartpicker.infinityfreeapp.com/api/';

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

    console.log('Proxying to:', targetUrl);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
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

    // Try to parse as JSON, otherwise return raw text for debugging
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: response.status });
    } catch {
      console.error('Non-JSON response from PHP:', text.substring(0, 500));
      return NextResponse.json(
        { error: 'Invalid response from API', raw: text.substring(0, 200) },
        { status: 500 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Proxy error:', message);
    return NextResponse.json(
      { error: 'Proxy request failed', details: message },
      { status: 500 }
    );
  }
}