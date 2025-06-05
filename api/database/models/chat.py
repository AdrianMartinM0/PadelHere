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

class ChatModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    partido_id: PyObjectId
    miembros: List[PyObjectId] = []
    mensajes: List = []  # Puedes definir un modelo de mensaje aparte si quieres

    class Config:
        json_encoders = {
            ObjectId: str
        }
        arbitrary_types_allowed = True
        schema_extra = {
            "example": {
                "partido_id": "665b9e4b5b0b7c1234567890",
                "miembros": ["665b9e4b5b0b7c1234567891", "665b9e4b5b0b7c1234567892"],
                "mensajes": []
            }
        }