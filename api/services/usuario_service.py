from ..database.db import user_collection, database
from ..database.models.usuario import User

async def create_user(data):
    users_collection = user_collection
    data = data.dict()
    user = User(**data)

    # Encriptar los datos sensibles antes de insertarlos en la base de datos
    user.encrypt_sensitive_data()

    user = user.model_dump()
    
    result = users_collection.insert_one(user)
    created_user = users_collection.find_one({"_id": result.inserted_id})

    # Convertir ObjectId a string antes de retornarlo
    if created_user:
        created_user["_id"] = str(created_user["_id"])
    
    return created_user

async def get_one_user(email):
    users_collection = user_collection
    user = users_collection.find_one({"email": email})
    return user