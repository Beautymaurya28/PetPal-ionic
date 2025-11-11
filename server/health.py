from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime  # <-- THIS IS THE FIX
from beanie import PydanticObjectId

from models import Pet, User, HealthRecord
from security import get_current_user

router = APIRouter(
    prefix="/api/records", 
    tags=["Health Records"]
)

# --- Schemas ---

class HealthRecordCreate(BaseModel):
    pet_id: str 
    title: str
    date: date
    notes: Optional[str] = None
    tags: Optional[List[str]] = []
    attachment_url: Optional[str] = None

class HealthRecordPublic(BaseModel):
    id: str
    pet_id: str
    owner_id: str
    title: str
    date: date
    notes: Optional[str] = None
    tags: Optional[List[str]] = []
    attachment_url: Optional[str] = None
    created_at: datetime # This line was causing the error

# --- Helper Function ---
def map_record_to_public(record: HealthRecord) -> HealthRecordPublic:
    return HealthRecordPublic(
        id=str(record.id),
        pet_id=str(record.pet_id),
        owner_id=str(record.owner_id),
        title=record.title,
        date=record.date,
        notes=record.notes,
        tags=record.tags,
        attachment_url=record.attachment_url,
        created_at=record.created_at
    )

# --- API Endpoints ---

@router.post("/", 
    response_model=HealthRecordPublic, 
    status_code=status.HTTP_201_CREATED)
async def create_health_record(
    record_in: HealthRecordCreate, 
    current_user: User = Depends(get_current_user)
):
    try:
        pet_obj_id = PydanticObjectId(record_in.pet_id)
    except Exception:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid Pet ID format.")

    pet = await Pet.get(pet_obj_id)
    
    if not pet or pet.owner_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pet not found.")
        
    new_record = HealthRecord(
        **record_in.model_dump(exclude={"pet_id"}), 
        pet_id=pet.id,
        owner_id=current_user.id
    )
    
    await new_record.insert()
    
    return map_record_to_public(new_record)

@router.get("/all", response_model=List[HealthRecordPublic])
async def get_all_my_records(
    current_user: User = Depends(get_current_user)
):
    """
    Get all health records for ALL pets owned by the
    currently logged-in user.
    """
    
    # This is a single, efficient database query:
    # "Find all records where the owner_id matches the logged-in user"
    records = await HealthRecord.find(
        HealthRecord.owner_id == current_user.id
    ).sort(-HealthRecord.date).to_list() # Sort by date, newest first
    
    return [map_record_to_public(record) for record in records]

@router.get("/pet/{pet_id}", response_model=List[HealthRecordPublic])
async def get_records_for_pet(
    pet_id: str,
    current_user: User = Depends(get_current_user)
):
    try:
        pet_obj_id = PydanticObjectId(pet_id)
    except Exception:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid Pet ID format.")

    pet = await Pet.get(pet_obj_id)
    
    if not pet or pet.owner_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pet not found.")
        
    records = await HealthRecord.find(
        HealthRecord.pet_id == pet.id
    ).sort(-HealthRecord.date).to_list() 
    
    return [map_record_to_public(record) for record in records]