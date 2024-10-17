import { NextResponse } from 'next/server';
import { POST } from '../app/api/chat/route';  // Adjust the import path as necessary

// Mock the global fetch function
global.fetch = jest.fn();

describe('POST /api/chat', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mock calls and instances after each test
  });

  it('should return a response from the backend API', async () => {
    // Set up the mock for fetch to return the expected response
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      new Response(JSON.stringify({ reply: 'I can assist you with Ethereum blockchain and DeFi data. Here are some commands you can try:\n\n**Etherscan Commands**:\n1. `Get eth supply` - Retrieve the total supply of Ethereum.\n2. `Get eth price` - Fetch the current Ethereum price.\n\n**DeFiLlama Commands**:\n1. `Get defi pools` - Get information about the first 5 DeFi pools.\n2. `Get defi pools id <pool_id>` - Get detailed information about a specific DeFi pool by its ID.\n\nFor unknown commands, I will do my best to assist using my built-in language model.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    // Create a mock request object
    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Help' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Call the POST function
    const response = await POST(request);

    // Check that the response is as expected
    expect(response).toBeInstanceOf(NextResponse);
    const jsonResponse = await response.json();
    expect(jsonResponse).toEqual({
      reply: 'I can assist you with Ethereum blockchain and DeFi data. Here are some commands you can try:\n\n**Etherscan Commands**:\n1. `Get eth supply` - Retrieve the total supply of Ethereum.\n2. `Get eth price` - Fetch the current Ethereum price.\n\n**DeFiLlama Commands**:\n1. `Get defi pools` - Get information about the first 5 DeFi pools.\n2. `Get defi pools id <pool_id>` - Get detailed information about a specific DeFi pool by its ID.\n\nFor unknown commands, I will do my best to assist using my built-in language model.',
    });
  });

  it('should handle errors from the backend API', async () => {
    // Set up the mock for fetch to simulate a network error
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error('Network error'));

    // Create a mock request object
    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Get defi pools id 1' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Call the POST function
    const response = await POST(request);

    // Check that the response has an error
    expect(response).toBeInstanceOf(NextResponse);
    const jsonResponse = await response.json();
    expect(jsonResponse).toEqual({ error: 'Failed to fetch response.' });
    expect(response.status).toBe(500);
  });
});
