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
    
    // Create new search params without the 'path' key
    const filteredParams = new URLSearchParams(searchParams);
    filteredParams.delete('path');
    
    const query = filteredParams.toString();
    const targetUrl = `${PHP_BASE}/${path}${query ? '?' + query : ''}`;

    const options: RequestInit = {
      method: request.method,
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
      },
    };

    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      options.body = await request.text();
    }

    const response = await fetch(targetUrl, options);
    
    // Check if the response is actually JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    // Fallback for non-JSON (like InfinityFree security HTML)
    const text = await response.text();
    console.error('Unexpected Response:', text.slice(0, 200));
    return NextResponse.json(
      { error: 'API returned non-JSON content', hint: 'Check if your host has a security landing page' },
      { status: 502 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: 'Proxy failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}