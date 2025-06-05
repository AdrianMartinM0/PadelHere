from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

active_connections = []

@router.websocket("/ws/reservas")
async def reservas_websocket(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()  # Mantén la conexión abierta
    except WebSocketDisconnect:
        active_connections.remove(websocket)

# Puedes añadir una función para enviar mensajes a todos:
async def notify_new_reserva(club_id):
    for ws in active_connections:
        await ws.send_json({"event": "new_reserva", "club_id": club_id})