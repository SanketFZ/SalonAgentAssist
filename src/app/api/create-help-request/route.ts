// File: src/app/api/create-help-request/route.ts
import { NextResponse } from 'next/server';
import { createHelpRequest as createHelpRequestInDb } from '@/server/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { callId, callerId, question } = body;

    if (!callId || !callerId || !question) {
      return NextResponse.json({ error: 'Missing required fields: callId, callerId, and question are required.' }, { status: 400 });
    }

    // Call your existing TypeScript function
    const helpRequestDocument = await createHelpRequestInDb(callId, callerId, question);

    // Return the created document or a success message
    return NextResponse.json(helpRequestDocument, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('[API Create Help Request] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create help request.', details: errorMessage }, { status: 500 });
  }
}