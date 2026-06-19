import { NextResponse } from 'next/server';

const NOT_AVAILABLE = NextResponse.json(
    { error: 'This MuAPI app endpoint is not available with fal.ai. Use /api/fal-storage for file uploads.' },
    { status: 503 }
);

export async function GET() { return NOT_AVAILABLE; }
export async function POST() { return NOT_AVAILABLE; }
export async function PUT() { return NOT_AVAILABLE; }
export async function DELETE() { return NOT_AVAILABLE; }
