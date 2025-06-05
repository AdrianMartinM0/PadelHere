from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

active_connections = []

@router.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()  # Mantén la conexión abierta
    except WebSocketDisconnect:
        active_connections.remove(websocket)


active_connections: list[WebSocket] = []

# Recibe el mensaje ya preparado (con _id, texto, fecha, autor, nombre, img_perfil)
async def notify_new_msg(mensaje):
    for ws in active_connections:
        await ws.send_json(mensaje)