import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import List

# --- Corrected Imports ---
# No more '..' needed since files are in the same directory
from models import (
    VetBooking, VetBookingRequest, User, Pet, VetCache, TokenData,
)
from config import settings
from security import get_current_user # <-- Let's assume you put this in security.py

# --- Router Setup ---
router = APIRouter()
auth_scheme = HTTPBearer()


# --- Helper Functions (No Changes) ---

def _curate_nearby_results(google_response: dict) -> List[dict]:
    curated_list = []
    for place in google_response.get("results", []):
        curated_list.append({
            "placeId": place.get("place_id"),
            "name": place.get("name"),
            "address": place.get("vicinity"),
            "location": place.get("geometry", {}).get("location"),
            "rating": place.get("rating"),
            "userRatingsTotal": place.get("user_ratings_total"),
            "isOpenNow": place.get("opening_hours", {}).get("open_now", "N/A"),
        })
    return curated_list

def _curate_details_results(google_response: dict) -> dict:
    result = google_response.get("result", {})
    return {
        "placeId": result.get("place_id"),
        "name": result.get("name"),
        "address": result.get("formatted_address"),
        "phone": result.get("formatted_phone_number"),
        "location": result.get("geometry", {}).get("location"),
        "rating": result.get("rating"),
        "reviews": result.get("reviews"),
        "openingHours": result.get("opening_hours", {}).get("weekday_text"),
        "website": result.get("website"),
    }


# --- API Endpoints (No logic changes, just how client is accessed) ---

@router.get("/nearby")
async def get_nearby_vets(
    request: Request, # <-- Use Request to get app state
    lat: float = Query(...), 
    lng: float = Query(...), 
    radius: int = 5000
):
    query_key = f"nearby:{lat}:{lng}:{radius}"
    # Get the http_client from the app's state (created in main.py)
    http_client = request.app.state.http_client 
    
    cached_data = await VetCache.find_one(VetCache.query_key == query_key)
    if cached_data and cached_data.expires_at > datetime.utcnow():
        return cached_data.data

    GOOGLE_NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lng}",
        "radius": radius,
        "type": "veterinary_care",
        "key": settings.GOOGLE_API_KEY,
    }

    try:
        response = await http_client.get(GOOGLE_NEARBY_URL, params=params)
        response.raise_for_status()
        data = response.json()
        curated_data = _curate_nearby_results(data)
        
        await VetCache.find_one(
            VetCache.query_key == query_key
        ).upsert(
            {"$set": { "data": curated_data, "expires_at": datetime.utcnow() + timedelta(hours=1) }},
            on_insert=VetCache(
                query_key=query_key,
                data=curated_data,
                expires_at=datetime.utcnow() + timedelta(hours=1)
            )
        )
        return curated_data
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="Error from Google Places API")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/details")
async def get_vet_details(
    request: Request, # <-- Use Request to get app state
    place_id: str = Query(...)
):
    query_key = f"details:{place_id}"
    http_client = request.app.state.http_client # <-- Get client from app state

    cached_data = await VetCache.find_one(VetCache.query_key == query_key)
    if cached_data and cached_data.expires_at > datetime.utcnow():
        return cached_data.data

    GOOGLE_DETAILS_URL = f"https://places.googleapis.com/v1/places/{place_id}"
    fields = "place_id,name,formatted_address,geometry.location,rating,formatted_phone_number,opening_hours.weekday_text,reviews,website"
    headers = {
        "X-Goog-Api-Key": settings.GOOGLE_API_KEY,
        "X-Goog-FieldMask": fields,
    }

    try:
        response = await http_client.get(GOOGLE_DETAILS_URL, headers=headers)
        response.raise_for_status()
        data = response.json()
        curated_data = _curate_details_results({"result": data})
        
        await VetCache.find_one(
            VetCache.query_key == query_key
        ).upsert(
            {"$set": { "data": curated_data, "expires_at": datetime.utcnow() + timedelta(hours=1) }},
            on_insert=VetCache(
                query_key=query_key,
                data=curated_data,
                expires_at=datetime.utcnow() + timedelta(hours=1)
            )
        )
        return curated_data
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="Error from Google Places Details API")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/book", response_model=VetBooking)
async def book_vet(
    booking_data: VetBookingRequest,
    current_user: User = Depends(get_current_user) # <-- Depends on security.py
):
    pet = await Pet.get(booking_data.petId)
    if not pet or pet.ownerId != str(current_user.id):
        raise HTTPException(status_code=404, detail="Pet not found or does not belong to user")
    
    booking = VetBooking(
        userId=str(current_user.id),
        **booking_data.model_dump()
    )
    await booking.insert()
    return booking