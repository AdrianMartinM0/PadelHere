from fastapi import APIRouter, UploadFile, File, Form, Body, Depends
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

@club_router.get("/{club_id}/config")
async def get_club_config(club_id: str):
    return await club_controller.get_club_config_controller(club_id)

@club_router.put("/{club_id}/config")
async def update_club_config(club_id: str, config_data: dict):
    return await club_controller.update_club_config_controller(club_id, config_data)

@club_router.get("/{club_id}/pistas")
async def get_club_courts(club_id: str):
    return await club_controller.get_club_courts_controller(club_id)

@club_router.post("/{club_id}/pistas")
async def add_court_to_club(club_id: str, court_data: dict):
    return await club_controller.add_court_to_club_controller(club_id, court_data)

@club_router.put("/{club_id}/pistas")
async def update_club_courts(club_id: str, data: dict = Body(...)):
    return await club_controller.update_club_courts_controller(club_id, data)

@club_router.get("/{club_id}/overrides")
async def get_overrides_route(club_id: str):
    return await club_controller.get_overrides_controller(club_id)

@club_router.put("/{club_id}/overrides/{date}")
async def set_override_for_date_route(club_id: str, date: str, override: dict = Body(...)):
    return await club_controller.set_override_for_date_controller(club_id, date, override)

@club_router.delete("/{club_id}/overrides/{date}")
async def delete_override_route(club_id: str, date: str):
    return await club_controller.delete_override_controller(club_id, date)