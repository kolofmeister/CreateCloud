import { NextResponse } from 'next/server';

// This route previously proxied to https://api.muapi.ai/api/v1/*.
// The fal.ai migration uses /api/fal/* instead (proxies to https://queue.fal.run).

const GONE = NextResponse.json(
    { error: 'This endpoint has moved. The fal.ai client now uses /api/fal/* instead of /api/v1/*.' },
    { status: 410 }
);

export async function GET() { return GONE; }
export async function POST() { return GONE; }
export async function PUT() { return GONE; }
export async function DELETE() { return GONE; }
