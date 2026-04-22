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
    const filteredParams = new URLSearchParams(searchParams);
    filteredParams.delete('path');
    
    const query = filteredParams.toString();
    const targetUrl = `${PHP_BASE}/${path}${query ? '?' + query : ''}`;

    // 1. Define your headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // 2. Add a common Browser User-Agent string
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    // 3. Forward the Authorization header if it exists
    const auth = request.headers.get('Authorization');
    if (auth) headers['Authorization'] = auth;

    const options: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.method === 'POST' || request.method === 'PUT') {
      options.body = await request.text();
    }

    const response = await fetch(targetUrl, options);
    const text = await response.text();

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: response.status });
    } catch {
      // Log this to your Vercel/Terminal console to see what PHP actually sent
      console.error('API Response was not JSON:', text.substring(0, 500));
      
      return NextResponse.json(
        { error: 'Invalid JSON response', raw: text.substring(0, 200) },
        { status: 502 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
  }
}