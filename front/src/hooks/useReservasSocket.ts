import { useEffect, useRef } from "react";

export function useReservasSocket(onNewReserva: (data: any) => void) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://padelhere-production.up.railway.app/ws/reservas");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === "new_reserva") {
          onNewReserva(msg);
        }
      } catch (e) {
        // Puedes loggear el error si quieres
      }
    };

    return () => {
      ws.close();
    };
  }, [onNewReserva]);
}