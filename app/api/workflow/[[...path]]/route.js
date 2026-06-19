import { NextResponse } from 'next/server';

const NOT_AVAILABLE = NextResponse.json(
    { error: 'Workflows are a MuAPI-specific feature and are not available with fal.ai. See docs/fal-ai-migration.md.' },
    { status: 503 }
);

export async function GET() { return NOT_AVAILABLE; }
export async function POST() { return NOT_AVAILABLE; }
export async function PUT() { return NOT_AVAILABLE; }
export async function DELETE() { return NOT_AVAILABLE; }
