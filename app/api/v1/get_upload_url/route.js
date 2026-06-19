import { NextResponse } from 'next/server';

// Previously proxied MuAPI's file upload URL endpoint.
// With fal.ai, use POST /api/fal-storage/storage/upload/initiate to get an upload URL.

export async function GET() {
    return NextResponse.json(
        { error: 'Use POST /api/fal-storage/storage/upload/initiate to get a fal.ai upload URL.' },
        { status: 410 }
    );
}
