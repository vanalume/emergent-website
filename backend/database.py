"""Central MongoDB connection shared by every router."""
from motor.motor_asyncio import AsyncIOMotorClient

from config import MONGO_URL, DB_NAME

client: AsyncIOMotorClient = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]


def close_db_client() -> None:
    """Close the shared async client (called on app shutdown)."""
    client.close()