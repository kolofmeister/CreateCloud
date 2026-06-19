import { NextResponse } from 'next/server';

const FAL_QUEUE_BASE = 'https://queue.fal.run';

function getApiKey(request) {
    const headerKey = request.headers.get('x-api-key');
    if (headerKey) return headerKey;
    const cookieKey = request.cookies.get('falai_key')?.value;
    return cookieKey;
}

function buildUpstreamHeaders(request, apiKey) {
    const headers = new Headers();
    headers.set('Content-Type', request.headers.get('Content-Type') || 'application/json');
    if (apiKey) headers.set('Authorization', `Key ${apiKey}`);
    return headers;
}

async function proxy(request, params, method) {
    const slug = await params;
    const pathSegments = slug.path || [];
    const path = pathSegments.join('/');
    const { search } = new URL(request.url);
    const targetUrl = `${FAL_QUEUE_BASE}/${path}${search}`;

    const apiKey = getApiKey(request);
    const headers = buildUpstreamHeaders(request, apiKey);

    try {
        let body;
        if (method !== 'GET' && method !== 'HEAD') {
            body = await request.arrayBuffer();
        }
        const response = await fetch(targetUrl, { method, headers, body });
        const contentType = response.headers.get('Content-Type') || 'application/json';
        const buffer = await response.arrayBuffer();
        return new NextResponse(buffer, {
            status: response.status,
            headers: { 'Content-Type': contentType },
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request, { params }) { return proxy(request, params, 'GET'); }
export async function POST(request, { params }) { return proxy(request, params, 'POST'); }
export async function PUT(request, { params }) { return proxy(request, params, 'PUT'); }
export async function DELETE(request, { params }) { return proxy(request, params, 'DELETE'); }
