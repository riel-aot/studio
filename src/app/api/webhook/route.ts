import { type NextRequest, NextResponse } from 'next/server';
import type { WebhookRequest, WebhookResponse } from '@/lib/events';
import { getMockResponse } from '@/lib/mock-api';

export async function POST(req: NextRequest) {
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!n8nWebhookUrl) {
    console.error('N8N_WEBHOOK_URL is not configured.');
    return NextResponse.json<WebhookResponse>({
      success: false,
      error: {
        message: 'Backend connection is not configured.',
        code: 'CONFIG_ERROR',
      },
      correlationId: 'local-config-error',
    }, { status: 500 });
  }

  try {
    const body: WebhookRequest = await req.json();

    // --- START MOCK RESPONSE ---
    // For development, we intercept the call and return mock data.
    if (process.env.NODE_ENV === 'development') {
      const mockResponse = getMockResponse(body);
      if (mockResponse) {
        // Add a fake delay to simulate network latency
        await new Promise(resolve => setTimeout(resolve, 500));
        return NextResponse.json(mockResponse);
      }
    }
    // --- END MOCK RESPONSE ---

    const authToken = req.headers.get('Authorization');

    if (!authToken) {
      return NextResponse.json<WebhookResponse>({
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
        correlationId: 'local-auth-error',
      }, { status: 401 });
    }

    // Forward the request to the n8n webhook URL
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
      },
      body: JSON.stringify(body),
    });

    // Handle cases where n8n itself is down or returns a non-JSON response
    if (!n8nResponse.ok) {
        // Try to get more info from the response if possible
        const errorText = await n8nResponse.text();
        console.error(`n8n returned a non-OK status: ${n8nResponse.status}`, errorText);
        return NextResponse.json<WebhookResponse>({
            success: false,
            error: {
                message: `The backend service returned an error (status: ${n8nResponse.status}).`,
                code: 'BACKEND_ERROR',
            },
            correlationId: 'n8n-network-error',
        }, { status: 502 }); // Bad Gateway
    }

    const responseData: WebhookResponse = await n8nResponse.json();

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in webhook gateway:', error);
    
    if (error instanceof SyntaxError) {
        return NextResponse.json<WebhookResponse>({
            success: false,
            error: { message: 'Invalid request body.', code: 'BAD_REQUEST' },
            correlationId: 'local-request-error',
        }, { status: 400 });
    }
    
    return NextResponse.json<WebhookResponse>({
      success: false,
      error: { message: 'An internal server error occurred in the gateway.', code: 'GATEWAY_ERROR' },
      correlationId: 'local-gateway-error',
    }, { status: 500 });
  }
}
