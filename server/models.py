from beanie import Document, PydanticObjectId
from pydantic import EmailStr, Field
from datetime import datetime, date, time
from typing import Optional, List

class User(Document):
    """
    Model for a User, as defined in the project plan.
    This is a Beanie 'Document', so it maps to a MongoDB collection.
    """
    # We don't need to define _id, Beanie handles it.
    
    name: str = Field(..., max_length=100)
    email: EmailStr  # Pydantic validates this is a real email format
    phone: str = Field(..., max_length=20)
    password_hash: str  # We will store the *hashed* password, never the plain text
    
    verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        # This tells Beanie to name the collection "users" in MongoDB
        name = "users"
        
    class Config:
        # This is for Pydantic: allows us to create a User from a dict
        from_attributes = True



# ... (imports) ...

class Pet(Document):
    """
    Model for a Pet, as defined in the project plan.
    """
    owner_id: PydanticObjectId 
    
    name: str = Field(..., max_length=100)
    species: str = Field(..., max_length=50)
    breed: Optional[str] = Field(None, max_length=50)
    dob: Optional[date] = None
    weight: Optional[float] = None
    photo_url: Optional[str] = None
    # --- ADD THIS NEW FIELD ---
    age: Optional[str] = Field(None, max_length=50) # e.g., "2 years", "6 months"
    # --- ADD THIS NEW FIELD ---
    about: Optional[str] = Field(None) # For personal notes
    last_vet_visit: Optional[date] = None
    # --- 1. ADD THESE NEW FIELDS ---
    last_vet_visit: Optional[date] = None
    last_vax_date: Optional[date] = None
    # We can use a simple bool for now, like your plan
    vaccinated: bool = Field(default=False) 
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "pets"
    

    # ... (Your User and Pet classes are above this) ...

class HealthRecord(Document):
    """
    Model for a single Health Record item.
    Linked to both a Pet and an Owner.
    """
    pet_id: PydanticObjectId      # Links to the Pet
    owner_id: PydanticObjectId    # Links to the User (for security)
    
    title: str = Field(..., max_length=150)
    date: date
    notes: Optional[str] = None
    
    # As per our plan: 'vaccine', 'prescription', 'surgery'
    tags: Optional[List[str]] = Field(default=[]) 
    
    # For now, we'll just store a URL.
    # Real file uploads are a big, separate feature.
    attachment_url: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "health_records"
    # ... (Config) ...



    # ... (Your User, Pet, and HealthRecord classes are above this) ...

class Reminder(Document):
    """
    Model for a single Reminder template.
    Linked to both a Pet and an Owner.
    """
    pet_id: PydanticObjectId      # Links to the Pet
    owner_id: PydanticObjectId    # Links to the User (for security)

    title: str = Field(..., max_length=150)
    notes: Optional[str] = None

    # We store date and time separately
    # This makes managing recurrence easier
    due_date: date                # The start date (for one-time) or first date
    due_time: Optional[time] = None   # The time of day (e.g., 08:00)

    # Recurrence rule
    # Can be "none", "daily", "weekly"
    recurrence: str = Field(default="none")

    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "reminders"