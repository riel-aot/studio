import { NextResponse } from 'next/server';
import { getWebhookUrl } from '@/lib/webhook-config';

export async function POST(req: Request) {
  try {
    const webhookUrl = getWebhookUrl('ASSESSMENT_IMAGE_EXTRACT');
    
    if (!webhookUrl) {
      return NextResponse.json({ error: 'Image extraction service not configured.' }, { status: 404 });
    }

    const formData = await req.formData();
    const imageFile = formData.get('data') as File;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    // Forward the binary data to n8n using the exact multipart format it expects
    const n8nFormData = new FormData();
    n8nFormData.append('data', imageFile);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: n8nFormData,
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: `Backend service error: ${response.status}`, details: text }, { status: response.status });
    }

    const data = await response.json().catch(async () => {
        const text = await response.text();
        return { output: text };
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[ProxyImage] Error:', error);
    return NextResponse.json({ error: error.message || 'Gateway error occurred.' }, { status: 500 });
  }
}
