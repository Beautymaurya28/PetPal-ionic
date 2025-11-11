from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, time, datetime
from beanie import PydanticObjectId

from models import Pet, User, Reminder
from security import get_current_user

router = APIRouter(
    prefix="/api/reminders",  # All routes here will start with /api/reminders
    tags=["Reminders"]
)

# --- Schemas ---

class ReminderCreate(BaseModel):
    """Schema for data we expect when CREATING a reminder."""
    pet_id: str
    title: str
    notes: Optional[str] = None
    due_date: date
    due_time: Optional[time] = None
    recurrence: str = "none"

# --- NEW: Schema for UPDATING a reminder ---
class ReminderUpdate(BaseModel):
    """Schema for data we expect when UPDATING a reminder."""
    title: Optional[str] = None
    notes: Optional[str] = None
    due_date: Optional[date] = None
    due_time: Optional[time] = None
    recurrence: Optional[str] = None
    # We'll add a 'completed' field later if we need it

class ReminderPublic(BaseModel):
    """Schema for data we send back to the client."""
    id: str
    pet_id: str
    owner_id: str
    title: str
    notes: Optional[str] = None
    due_date: date
    due_time: Optional[time] = None
    recurrence: str
    created_at: datetime

# --- Helper Function ---

def map_reminder_to_public(reminder: Reminder) -> ReminderPublic:
    """Safely converts a DB model to a public schema."""
    return ReminderPublic(
        id=str(reminder.id),
        pet_id=str(reminder.pet_id),
        owner_id=str(reminder.owner_id),
        title=reminder.title,
        notes=reminder.notes,
        due_date=reminder.due_date,
        due_time=reminder.due_time,
        recurrence=reminder.recurrence,
        created_at=reminder.created_at
    )

# --- API Endpoints ---

@router.post("/",
    response_model=ReminderPublic,
    status_code=status.HTTP_201_CREATED)
async def create_reminder(
    reminder_in: ReminderCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new reminder for one of the user's pets.
    """
    try:
        pet_obj_id = PydanticObjectId(reminder_in.pet_id)
    except Exception:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid Pet ID format.")

    pet = await Pet.get(pet_obj_id)
    
    if not pet or pet.owner_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pet not found.")
        
    new_reminder = Reminder(
        **reminder_in.model_dump(exclude={"pet_id"}),
        pet_id=pet.id,
        owner_id=current_user.id
    )
    
    await new_reminder.insert()
    
    return map_reminder_to_public(new_reminder)


# --- NEW: Get ALL reminders for the logged-in user ---
@router.get("/all", response_model=List[ReminderPublic])
async def get_all_my_reminders(
    current_user: User = Depends(get_current_user)
):
    """
    Get all reminders for ALL pets owned by the
    currently logged-in user.
    """
    reminders = await Reminder.find(
        Reminder.owner_id == current_user.id
    ).sort(+Reminder.due_date).to_list()  # Sort by date
    
    return [map_reminder_to_public(r) for r in reminders]


@router.get("/pet/{pet_id}", response_model=List[ReminderPublic])
async def get_reminders_for_pet(
    pet_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get all reminders for a specific pet.
    """
    try:
        pet_obj_id = PydanticObjectId(pet_id)
    except Exception:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid Pet ID format.")

    pet = await Pet.get(pet_obj_id)
    
    if not pet or pet.owner_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pet not found.")
        
    reminders = await Reminder.find(
        Reminder.pet_id == pet.id
    ).sort(+Reminder.due_date).to_list()
    
    return [map_reminder_to_public(r) for r in reminders]


# --- NEW: Update a specific reminder ---
@router.put("/{reminder_id}", response_model=ReminderPublic)
async def update_reminder(
    reminder_id: str,
    reminder_in: ReminderUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update a reminder's details.
    """
    try:
        obj_id = PydanticObjectId(reminder_id)
    except Exception:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid Reminder ID")

    reminder = await Reminder.get(obj_id)
    
    if not reminder or reminder.owner_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Reminder not found")
        
    update_data = reminder_in.model_dump(exclude_unset=True)
    
    if update_data:
        for key, value in update_data.items():
            setattr(reminder, key, value)
        await reminder.save()

    return map_reminder_to_public(reminder)


# --- NEW: Delete a specific reminder ---
class DeleteResponse(BaseModel):
    success: bool
    message: str

@router.delete("/{reminder_id}", response_model=DeleteResponse)
async def delete_reminder(
    reminder_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a reminder.
    """
    try:
        obj_id = PydanticObjectId(reminder_id)
    except Exception:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid Reminder ID")
        
    reminder = await Reminder.get(obj_id)
    
    if not reminder or reminder.owner_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Reminder not found")
        
    await reminder.delete()
    
    return DeleteResponse(success=True, message="Reminder deleted successfully")