# from typing import Union
from fastapi import FastAPI, APIRouter
from routes import api_router
from fastapi.middleware.cors import CORSMiddleware
from websockets import reservas_ws, partido_ws, chat_ws

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir cualquier origen
    allow_credentials=True,  # Permitir el envío de cookies o credenciales
    allow_methods=["*"],  # Permitir cualquier método HTTP (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Permitir cualquier encabezado
)

router = APIRouter()

app.include_router(api_router.router, prefix='/v1')

# Incluye routers de WebSocket
app.include_router(reservas_ws.router)
app.include_router(partido_ws.router)
app.include_router(chat_ws.router)

# Arrancar server: fastapi run main.py