import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv('MONGO_URI')
db = MongoClient(uri)

database = db.padel_here
user_collection = database.get_collection("usuario")
club_collection = database.get_collection("club")
pista_collection = database.get_collection("pista")
reserva_collection = database.get_collection("reserva")
partido_collection = database.get_collection("partido")
chat_collection = database.get_collection("chat")
mensaje_collection = database.get_collection("mensaje")
history_level_collection = database.get_collection("history_level")