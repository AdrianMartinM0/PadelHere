from ..database.db import user_collection
from ..database.models.usuario import User

async def create_user(data):
    users_collection = user_collection
    data = data.dict()
    user = User(**data)

    # Encriptar los datos sensibles antes de insertarlos en la base de datos
    user.hash_password()

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

async def login_user_service(email: str, password: str):
    # Buscar el usuario en la base de datos por email
    user_data = user_collection.find_one({"email": email})
    
    if not user_data:
        return None

    # Convertir el documento de MongoDB en un objeto User
    user = User(
        id=str(user_data["_id"]),
        name=user_data["name"],
        email=user_data["email"],
        password=user_data["password"],
    )

    # Validar la contraseña usando el método verify_password del modelo User
    if not user.verify_password(password):
        return None

    return user