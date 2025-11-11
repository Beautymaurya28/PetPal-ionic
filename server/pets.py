from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date
from beanie import PydanticObjectId

from models import Pet, User
from security import get_current_user

router = APIRouter(
    prefix="/api/pets",
    tags=["Pets"]
)

# --- Pydantic Schemas (These are correct) ---

class PetCreate(BaseModel):
    name: str
    species: str
    breed: Optional[str] = None
    dob: Optional[date] = None
    weight: Optional[float] = None
    photo_url: Optional[str] = None
    age: Optional[str] = None
    about: Optional[str] = None
    last_vet_visit: Optional[date] = None
    last_vax_date: Optional[date] = None
    vaccinated: bool = False

class PetUpdate(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    breed: Optional[str] = None
    dob: Optional[date] = None
    weight: Optional[float] = None
    photo_url: Optional[str] = None
    age: Optional[str] = None
    about: Optional[str] = None
    last_vet_visit: Optional[date] = None
    last_vax_date: Optional[date] = None
    vaccinated: Optional[bool] = None

class PetPublic(BaseModel):
    id: str
    owner_id: str
    name: str
    species: str
    breed: Optional[str] = None
    dob: Optional[date] = None
    weight: Optional[float] = None
    photo_url: Optional[str] = None
    age: Optional[str] = None
    about: Optional[str] = None
    last_vet_visit: Optional[date] = None
    last_vax_date: Optional[date] = None
    vaccinated: bool = False
    
    class Config:
        from_attributes = True

class DeleteResponse(BaseModel):
    success: bool
    message: str


# --- Helper Function (NEW) ---
# We will use this to guarantee all fields are mapped

def map_pet_to_public(pet: Pet) -> PetPublic:
    """Safely converts a Pet database model to a PetPublic schema."""
    return PetPublic(
        id=str(pet.id),
        owner_id=str(pet.owner_id),
        name=pet.name,
        species=pet.species,
        breed=pet.breed,
        dob=pet.dob,
        weight=pet.weight,
        photo_url=pet.photo_url,
        age=pet.age,
        about=pet.about, # <-- The most important line!
        last_vet_visit=pet.last_vet_visit,
        last_vax_date=pet.last_vax_date,
        vaccinated=pet.vaccinated
    )

# --- API Endpoints (REPLACED) ---

@router.post("/", 
    response_model=PetPublic, 
    status_code=status.HTTP_201_CREATED)
async def create_pet(
    pet_in: PetCreate, 
    current_user: User = Depends(get_current_user) 
):
    """
    Create a new pet for the currently logged-in user.
    """
    new_pet = Pet(
        **pet_in.model_dump(),
        owner_id=current_user.id 
    )
    await new_pet.insert()
    
    # Use our new helper function
    return map_pet_to_public(new_pet)


@router.get("/", response_model=List[PetPublic])
async def get_my_pets(
    current_user: User = Depends(get_current_user)
):
    """
    Get a list of all pets owned by the currently logged-in user.
    """
    pets = await Pet.find(Pet.owner_id == current_user.id).to_list()
    
    # Use our new helper function for every pet
    return [map_pet_to_public(pet) for pet in pets]


@router.get("/{pet_id}", response_model=PetPublic)
async def get_pet_by_id(
    pet_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get a single pet by its ID.
    """
    try:
        obj_id = PydanticObjectId(pet_id)
    except Exception:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid Pet ID")

    pet = await Pet.get(obj_id)
    
    if not pet or pet.owner_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pet not found")
    
    # Use our new helper function
    return map_pet_to_public(pet)


@router.put("/{pet_id}", response_model=PetPublic)
async def update_pet(
    pet_id: str,
    pet_in: PetUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update a pet's details.
    """
    try:
        obj_id = PydanticObjectId(pet_id)
    except Exception:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid Pet ID")

    pet = await Pet.get(obj_id)
    
    if not pet or pet.owner_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pet not found")
        
    update_data = pet_in.model_dump(exclude_unset=True)
    
    if update_data:
        for key, value in update_data.items():
            setattr(pet, key, value)
        
        await pet.save()

    # Use our new helper function on the (now updated) pet
    return map_pet_to_public(pet)


@router.delete("/{pet_id}", response_model=DeleteResponse)
async def delete_pet(
    pet_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a pet.
    """
    try:
        obj_id = PydanticObjectId(pet_id)
    except Exception:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid Pet ID")
        
    pet = await Pet.get(obj_id)
    
    if not pet or pet.owner_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pet not found")
        
    await pet.delete()
    
    return DeleteResponse(success=True, message="Pet deleted successfully")