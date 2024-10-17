// app/api/chat/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { message } = await request.json();

  try {
    // Change this URL to your backend API
    const response = await fetch('http://localhost:8000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch response.' }, { status: 500 });
  }
}
