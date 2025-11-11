import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from typing import List, Type
# 1. Import our new central settings
from config import settings 
from models import User, Pet, HealthRecord, Reminder # <-- Add Reminder
# 2. Import your models
from models import User 

# --- Database Initialization Function ---
async def init_db():
    """
    Initializes the database connection and Beanie.
    """
    print("Connecting to MongoDB...")
    
    # 3. Use the DATABASE_URL from our central settings
    client = AsyncIOMotorClient(settings.DATABASE_URL)

    database = client.petpal_db

    document_models: List[Type] = [User, Pet, HealthRecord, Reminder] # <-- Add Reminder

    await init_beanie(database=database, document_models=document_models)

    print("Successfully connected to MongoDB and initialized Beanie.")