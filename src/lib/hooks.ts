'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { EventName, WebhookRequest, WebhookResponse } from './events';
import { useToast } from '@/hooks/use-toast';
import { devLogger } from './logger';

interface UseWebhookOptions<P> {
  eventName: EventName;
  payload?: P;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  // If true, the hook will not run automatically on mount. Call `trigger` manually.
  manual?: boolean; 
}

const EMPTY_PAYLOAD = {};

export function useWebhook<P, R>({
  eventName,
  payload = EMPTY_PAYLOAD as P,
  onSuccess,
  onError,
  manual = false,
}: UseWebhookOptions<P>) {
  const [data, setData] = useState<R | null>(null);
  const [error, setError] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(!manual);
  const { user, token } = useAuth();
  const { toast } = useToast();

  const callWebhook = useCallback(async (triggerPayload?: P) => {
    if (!user || !token) {
      // Don't run if user is not authenticated. The AuthProvider should handle redirects.
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null);

    const finalPayload = triggerPayload ?? payload;

    const requestBody: WebhookRequest<P> = {
      eventName,
      requestId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      actor: {
        role: user.role,
        userId: user.id,
      },
      payload: finalPayload,
    };
    
    try {
      const response = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseData: WebhookResponse<R> = await response.json();
      
      devLogger.log({
          timestamp: new Date().toISOString(),
          eventName,
          request: requestBody,
          response: responseData,
          status: responseData.success ? 'success' : 'error',
          correlationId: responseData.correlationId,
      });

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.error?.message || 'An unknown error occurred');
      }

      setData(responseData.data as R);
      if (onSuccess) {
        onSuccess(responseData.data);
      }
    } catch (err: any) {
      setError(err);
      if (onError) {
        onError(err);
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [eventName, user, token, payload, onSuccess, onError, toast]);
  
  useEffect(() => {
    if (!manual) {
      callWebhook();
    }
  // The dependencies are carefully chosen to re-run only when needed.
  // We stringify the payload to compare its value, not its reference.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName, user, token, manual, JSON.stringify(payload)]);

  return { data, error, isLoading, trigger: callWebhook };
}
