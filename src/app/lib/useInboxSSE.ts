import { useEffect, useRef } from 'react';
import { authService } from './auth';
import config from './config';
import type { Message } from './api';

interface SSECallbacks {
    onNewMessage: (data: { conversation_id: string; message: Message }) => void;
    onHitlChanged: (data: { conversation_id: string; hitl: boolean }) => void;
}

/**
 * Opens a Server-Sent Events connection to /conversation/events for the
 * current shop. Calls the provided callbacks whenever the backend emits
 * a new_message or hitl_changed event.
 *
 * Reconnects automatically with exponential back-off (1s → 30s cap) on error.
 * Cookies are sent automatically by EventSource (withCredentials: true).
 */
export function useInboxSSE({ onNewMessage, onHitlChanged }: SSECallbacks): void {
    // Keep callbacks in a ref so reconnects always use the latest closures
    const callbacksRef = useRef<SSECallbacks>({ onNewMessage, onHitlChanged });
    callbacksRef.current = { onNewMessage, onHitlChanged };

    useEffect(() => {
        const shopId = authService.getCurrentShopId();
        if (!shopId) return;

        let es: EventSource | null = null;
        let retryTimeout: ReturnType<typeof setTimeout> | null = null;
        let retryDelay = 1000;
        let destroyed = false;

        function connect() {
            if (destroyed) return;

            const url = `${config.apiBaseUrl}/conversation/events?shop_id=${encodeURIComponent(shopId!)}`;
            es = new EventSource(url, { withCredentials: true });

            es.addEventListener('new_message', (e: MessageEvent) => {
                try {
                    callbacksRef.current.onNewMessage(JSON.parse(e.data));
                } catch (_) {}
            });

            es.addEventListener('hitl_changed', (e: MessageEvent) => {
                try {
                    callbacksRef.current.onHitlChanged(JSON.parse(e.data));
                } catch (_) {}
            });

            es.onopen = () => {
                retryDelay = 1000; // reset back-off on successful connect
            };

            es.onerror = () => {
                es?.close();
                es = null;
                if (destroyed) return;
                retryTimeout = setTimeout(() => {
                    retryDelay = Math.min(retryDelay * 2, 30000);
                    connect();
                }, retryDelay);
            };
        }

        connect();

        return () => {
            destroyed = true;
            if (retryTimeout) clearTimeout(retryTimeout);
            es?.close();
        };
    }, []); // only on mount — shopId is stable per session
}
