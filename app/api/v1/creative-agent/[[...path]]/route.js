import { NextResponse } from 'next/server';

const NOT_AVAILABLE = NextResponse.json(
    { error: 'Creative Agent is a MuAPI-specific feature and is not available with fal.ai. See docs/fal-ai-migration.md.' },
    { status: 503 }
);

export async function GET() { return NOT_AVAILABLE; }
export async function POST() { return NOT_AVAILABLE; }
export async function PATCH() { return NOT_AVAILABLE; }
export async function DELETE() { return NOT_AVAILABLE; }
