from pydantic import BaseModel, Field
from typing import List, Optional
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError('Invalid objectid')
        return ObjectId(v)

class UnreadInfo(BaseModel):
    user_id: PyObjectId
    last_read_message_id: Optional[PyObjectId] = None  # Puede ser None si nunca leyó

class ChatModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    partido_id: PyObjectId
    miembros: List[PyObjectId] = []
    mensajes: List = []  # Puedes definir un modelo de mensaje aparte si quieres
    # unreads: List[UnreadInfo] = []  # <--- Añadido aquí
