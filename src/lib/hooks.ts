'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { EventName, WebhookRequest, WebhookResponse } from './events';
import { useToast } from '@/hooks/use-toast';
import { devLogger } from './logger';

interface UseWebhookOptions<P> {
  eventName: EventName;
  payload?: P;
  onSuccess?: (data: any, payload?: P) => void;
  onError?: (error: any) => void;
  errorMessage?: string;
  manual?: boolean; 
}

const EMPTY_PAYLOAD = {};

export function useWebhook<P, R>({
  eventName,
  payload: initialPayload = EMPTY_PAYLOAD as P,
  onSuccess,
  onError,
  errorMessage,
  manual = false,
}: UseWebhookOptions<P>) {
  const [data, setData] = useState<R | null>(null);
  const [error, setError] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(!manual);
  const { user, token } = useAuth();
  const { toast } = useToast();

  const payload = useMemo(() => initialPayload, [JSON.stringify(initialPayload)]);

  const callWebhook = useCallback(async (triggerPayload?: P) => {
    if (!user || !token) {
      return;
    }

    setIsLoading(true);
    setError(null);
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
        const errMessage = responseData.error?.message || 'An unknown error occurred';
        throw new Error(errMessage);
      }

      setData(responseData.data as R);
      if (onSuccess) {
        onSuccess(responseData.data, finalPayload);
      }
    } catch (err: any) {
      setError(err);
      if (onError) {
        onError(err);
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage || err.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [eventName, payload, onSuccess, onError, toast, user, token, errorMessage]);
  
  useEffect(() => {
    if (!manual) {
      callWebhook();
    }
  }, [manual, callWebhook]);

  const trigger = useCallback((triggerPayload?: P) => callWebhook(triggerPayload), [callWebhook]);

  return { data, error, isLoading, trigger };
}
