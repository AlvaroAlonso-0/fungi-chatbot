// app/api/chat/route.ts

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { message } = await req.json();

  if (!message) {
    return NextResponse.json({ reply: 'Message is required.' }, { status: 400 });
  }

  // Simulate a response from the chatbot.
  const botReply = `You said: ${message}`;
  return NextResponse.json({ reply: botReply });
}
