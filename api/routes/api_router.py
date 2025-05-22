from fastapi import APIRouter
from . import usuario_router, club_router

router = APIRouter()

router.include_router(usuario_router.usu_router, prefix='/usuario', tags=["usuarios"])
router.include_router(club_router.club_router, prefix='/club', tags=["clubs"])