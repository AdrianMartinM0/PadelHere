from fastapi import APIRouter
from . import usuario_router

router = APIRouter()

router.include_router(usuario_router.usu_router, prefix='/usuario', tags=["usuarios"])