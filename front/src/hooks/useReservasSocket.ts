import { useEffect, useRef } from "react";

export function useReservasSocket(onNewReserva: (data: Record<string, unknown>) => void) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("wss://padelhere.onrender.com/ws/reservas");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === "new_reserva") {
          onNewReserva(msg);
        }
      } catch {
        // Puedes loggear el error si quieres
      }
    };

    return () => {
      ws.close();
    };
  }, [onNewReserva]);
}