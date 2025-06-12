from fastapi import APIRouter
from routes import usuario_router, club_router, pista_router, reserva_router, partido_router, chat_router, mensaje_router, history_level_router

router = APIRouter()

router.include_router(usuario_router.usu_router, prefix='/usuario', tags=["usuarios"])
router.include_router(club_router.club_router, prefix='/club', tags=["clubs"])
router.include_router(pista_router.pista_router, prefix='/pista', tags=["pistas"])
router.include_router(reserva_router.reserva_router, prefix='/reserva', tags=["reservas"])
router.include_router(partido_router.partido_router, prefix='/partido', tags=["partidos"])
router.include_router(chat_router.chat_router, prefix='/chat', tags=["chats"])
router.include_router(mensaje_router.mensaje_router, prefix='/mensaje', tags=["mensajes"])
router.include_router(history_level_router.history_level_router, prefix='/history_level', tags=["history_levels"])