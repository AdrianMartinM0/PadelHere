from pydantic import BaseModel, Field
from typing import Optional, List
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

class HistoryLevelModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    user_id: PyObjectId = Field(...)
    niveles: List[int] = Field(...)