import { NextRequest, NextResponse } from 'next/server';

const PHP_BASE = process.env.PHP_API_URL || 'https://pcpartpicker.infinityfreeapp.com/api';

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
    // Get the target path and query from the request URL
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '';
    
    // Build query string without the 'path' param
    searchParams.delete('path');
    const query = searchParams.toString();
    const targetUrl = `${PHP_BASE}/${path}${query ? '?' + query : ''}`;

    // Forward the request to InfinityFree
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward Authorization header if present
    const auth = request.headers.get('Authorization');
    if (auth) headers['Authorization'] = auth;

    const options: RequestInit = {
      method: request.method,
      headers,
    };

    // Forward body for POST/PUT
    if (request.method === 'POST' || request.method === 'PUT') {
      const body = await request.text();
      if (body) options.body = body;
    }

    const response = await fetch(targetUrl, options);
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}