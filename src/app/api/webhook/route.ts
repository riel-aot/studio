import { type NextRequest, NextResponse } from 'next/server';
import type { WebhookRequest, WebhookResponse } from '@/lib/events';
import { getMockResponse } from '@/lib/mock-api';
import { getWebhookUrl } from '@/lib/webhook-config';

export async function POST(req: NextRequest) {
  try {
    const body: WebhookRequest = await req.json();

    // Standard live events list prior to diagnostic expansion
    const liveEvents = [
      'STUDENT_LIST',
      'STUDENT_GET',
      'STUDENT_CREATE',
      'ASSESSMENT_LIST',
      'ASSESSMENT_GET',
      'ASSESSMENT_CREATE_DRAFT',
      'RUBRIC_LIST',
      'REPORTS_LIST',
      'REPORT_GET'
    ];

    const webhookUrl = getWebhookUrl(body.eventName);

    // Use mock data if in development and not explicitly marked as a live event
    if (
      process.env.NODE_ENV === 'development' &&
      (!liveEvents.includes(body.eventName) || !webhookUrl)
    ) {
      const mockResponse = getMockResponse(body);
      if (mockResponse) {
        return NextResponse.json(mockResponse);
      }
    }

    if (!webhookUrl) {
      return NextResponse.json<WebhookResponse>({
        success: false,
        error: {
          message: `Endpoint not configured for ${body.eventName}.`,
          code: 'NOT_CONFIGURED',
        },
        correlationId: 'error-' + Date.now(),
      }, { status: 404 });
    }

    const authToken = req.headers.get('Authorization');

    if (!authToken) {
      return NextResponse.json<WebhookResponse>({
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
        correlationId: 'auth-error-' + Date.now(),
      }, { status: 401 });
    }

    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
      },
      body: JSON.stringify(body),
    });

    if (!n8nResponse.ok) {
        return NextResponse.json<WebhookResponse>({
            success: false,
            error: {
                message: `Backend error: ${n8nResponse.status}`,
                code: 'BACKEND_ERROR',
            },
            correlationId: 'n8n-error-' + Date.now(),
        }, { status: 502 });
    }

    const responseData: WebhookResponse = await n8nResponse.json();
    return NextResponse.json(responseData);

  } catch (error) {
    return NextResponse.json<WebhookResponse>({
      success: false,
      error: { message: 'Gateway error occurred.', code: 'INTERNAL_ERROR' },
      correlationId: 'gateway-error-' + Date.now(),
    }, { status: 500 });
  }
}
