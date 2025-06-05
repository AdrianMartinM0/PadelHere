from fastapi import APIRouter, UploadFile, File, Form, Depends
from ..controllers import usuario_controller
from ..database.models.usuario import User
from pydantic import EmailStr, BaseModel
from fastapi.security import OAuth2AuthorizationCodeBearer, OAuth2PasswordBearer

usu_router = APIRouter()

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl="https://accounts.google.com/o/oauth2/auth",
    tokenUrl="https://oauth2.googleapis.com/token"
)

oauth2_scheme_password = OAuth2PasswordBearer(tokenUrl="token")

class GoogleLoginRequest(BaseModel):
    token: str

@usu_router.post("/login")
async def login_user(login_request: dict):
    return await usuario_controller.login_controller(login_request)

@usu_router.post('/register')
async def create_user(user: User):
    return await usuario_controller.create_user_controller(user)

@usu_router.get('/recover')
async def recover_pass(email: EmailStr):
    # return {'email': email}
    return await usuario_controller.recover_password_controller(email)

@usu_router.get('/passcode')
async def get_passcode(email: EmailStr):
    return await usuario_controller.get_passcode_controller(email)

class ChangePasswordRequest(BaseModel):
    email: EmailStr
    passcode: str
    new_password: str

@usu_router.post('/changePassword')
async def change_password(request: ChangePasswordRequest):
    return await usuario_controller.change_password_service(request.email, request.passcode, request.new_password)

@usu_router.get("/verify-jwt")
async def verify_jwt(token: str):
    return await usuario_controller.verify_jwt_controller(token)

@usu_router.get("/user")
async def get_user(email: EmailStr):
    return await usuario_controller.get_one_user_controller(email)

@usu_router.post("/update-desc")
async def update_desc(email: EmailStr = Form(...), desc: str = Form(...)):
    return await usuario_controller.update_desc_controller(email, desc)

@usu_router.post("/update-profile-picture")
async def update_profile_picture(email: EmailStr = Form(...), picture: UploadFile = File(...)):
    picture_bytes = await picture.read()
    return await usuario_controller.update_profile_picture_service(email, picture_bytes)

@usu_router.post("/update-level")
async def update_level(email: EmailStr = Form(...), level: int = Form(...)):
    return await usuario_controller.update_level_controller(email, level)

@usu_router.put("/{user_id}/reservas/{reserva_id}")
async def add_reserva_id_route(user_id: str, reserva_id: str):
    return await usuario_controller.add_reserva_to_user_controller(user_id, reserva_id)

@usu_router.get("/{user_id}")
async def get_user_by_id(user_id: str):
    return await usuario_controller.get_user_by_id_controller(user_id)

@usu_router.post("/auth/google")
async def google_login(data: GoogleLoginRequest):
    return await usuario_controller.google_login_controller(data.token)

@usu_router.delete("/{user_id}")
async def delete_user(user_id: str):
    return await usuario_controller.delete_user_controller(user_id)