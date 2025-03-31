import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv('MONGO_URI')
db = MongoClient(uri)

database = db.padel_here
user_collection = database.get_collection("usuario")