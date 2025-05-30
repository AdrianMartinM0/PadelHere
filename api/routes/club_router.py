from fastapi import APIRouter, UploadFile, File, Form
from ..controllers import club_controller
from ..database.models.club import Club

from pydantic import EmailStr, BaseModel
from fastapi.security import OAuth2AuthorizationCodeBearer, OAuth2PasswordBearer
# from ..services.clubario_service import get_google_user

club_router = APIRouter()

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl="https://accounts.google.com/o/oauth2/auth",
    tokenUrl="https://oauth2.googleapis.com/token"
)

oauth2_scheme_password = OAuth2PasswordBearer(tokenUrl="token")

@club_router.post("/login")
async def login_user(login_request: dict):
    return await club_controller.login_controller(login_request)

@club_router.post('/register')
async def create_user(club: Club):
    return await club_controller.create_club_controller(club)

@club_router.get('/recover')
async def recover_pass(email: EmailStr):
    # return {'email': email}
    return await club_controller.recover_password_controller(email)

@club_router.get('/passcode')
async def get_passcode(email: EmailStr):
    return await club_controller.get_passcode_controller(email)

class ChangePasswordRequest(BaseModel):
    email: EmailStr
    passcode: str
    new_password: str

@club_router.post('/changePassword')
async def change_password(request: ChangePasswordRequest):
    return await club_controller.change_password_service(
        request.email, request.passcode, request.new_password
    )

@club_router.get("/club")
async def get_club(email: EmailStr):
    return await club_controller.get_one_club_controller(email)

@club_router.post("/update-desc")
async def update_desc(email: EmailStr = Form(...), desc: str = Form(...)):
    return await club_controller.update_desc_controller(email, desc)

@club_router.post("/update-profile-picture")
async def update_profile_picture(email: EmailStr = Form(...), picture: UploadFile = File(...)):
    picture_bytes = await picture.read()
    return await club_controller.update_profile_picture_service(email, picture_bytes)
