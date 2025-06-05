from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId
from datetime import datetime

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError('Invalid objectid')
        return ObjectId(v)

class MensajeModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    chat_id: PyObjectId = Field(...)
    autor: PyObjectId = Field(...)
    texto: str = Field(...)
    fecha: Optional[datetime] = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat() if isinstance(v, datetime) else v
        }
        arbitrary_types_allowed = True
        schema_extra = {
            "example": {
                "chat_id": "665b9e4b5b0b7c1234567890",
                "autor": "665b9e4b5b0b7c1234567892",
                "texto": "¡Hola a todos!",
                "fecha": "2025-06-03T22:47:57.123Z"
            }
        }