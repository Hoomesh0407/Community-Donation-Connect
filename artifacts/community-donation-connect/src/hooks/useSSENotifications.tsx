import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const TYPE_ICONS: Record<string, string> = {
  match: "New match found",
  accepted: "Match accepted",
  confirmed: "Exchange confirmed",
  review: "Review received",
  system: "Update",
};

export function useSSENotifications() {
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      esRef.current?.close();
      esRef.current = null;
      return;
    }

    const token = localStorage.getItem("cdc_token");
    if (!token) return;

    let cancelled = false;

    function connect() {
      if (cancelled) return;
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const url = `${base}/api/notifications/stream?token=${encodeURIComponent(token!)}`;
      const es = new EventSource(url);
      esRef.current = es;

      es.onmessage = (e) => {
        try {
          const notif = JSON.parse(e.data) as {
            title: string; message: string; type: string;
          };
          toast({
            title: notif.title,
            description: notif.message,
          });
          queryClient.invalidateQueries({ queryKey: ["listNotifications"] });
        } catch {}
      };

      es.onerror = () => {
        es.close();
        esRef.current = null;
        if (!cancelled) {
          reconnectTimer.current = setTimeout(connect, 5000);
        }
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      esRef.current?.close();
      esRef.current = null;
    };
  }, [isLoggedIn]);
}
