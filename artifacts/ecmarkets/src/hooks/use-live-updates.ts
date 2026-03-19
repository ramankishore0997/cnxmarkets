import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useLiveUpdates() {
  const queryClient = useQueryClient();
  const readerRef   = useRef<ReadableStreamDefaultReader | null>(null);
  const activeRef   = useRef(true);

  useEffect(() => {
    const token = localStorage.getItem('ecm_token');
    if (!token) return;

    activeRef.current = true;

    async function connect() {
      try {
        const res = await fetch(`/api/events/stream?token=${encodeURIComponent(token!)}`, {
          headers: { Accept: 'text/event-stream' },
        });
        if (!res.ok || !res.body) return;

        const reader = res.body.getReader();
        readerRef.current = reader;
        const decoder = new TextDecoder();
        let buffer = '';

        while (activeRef.current) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          let eventName = '';
          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              if (eventName === 'balance_updated') {
                queryClient.invalidateQueries();
              }
              eventName = '';
            }
          }
        }
      } catch {
        // reconnect after 5s on error
        if (activeRef.current) setTimeout(connect, 5_000);
      }
    }

    connect();

    return () => {
      activeRef.current = false;
      readerRef.current?.cancel().catch(() => {});
    };
  }, [queryClient]);
}
