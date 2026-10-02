from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

client = AsyncIOMotorClient(settings.mongo_uri)
db = client[settings.database_name]

users_collection = db["users"]
candidates_collection = db["candidates"]
recruiters_collection = db["recruiters"]
jobs_collection = db["jobs"]
applications_collection = db["applications"]
