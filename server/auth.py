from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr

# Import our User model and security functions
from models import User
from security import hash_password, create_access_token, verify_password # <-- 1. Import verify_password

# --- Create an APIRouter ---
router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


# --- Define Pydantic "Schemas" ---

class UserCreate(BaseModel):
    """Schema for data we expect when a user signs up."""
    name: str
    email: EmailStr
    phone: str
    password: str

# --- 2. NEW SCHEMA FOR LOGIN ---
class UserLogin(BaseModel):
    """Schema for data we expect when a user logs in."""
    email: EmailStr
    password: str
# --- END NEW SCHEMA ---

class UserPublic(BaseModel):
    """Schema for data we send back to the client (NEVER send password hash)."""
    id: str
    name: str
    email: EmailStr
    
class Token(BaseModel):
    """Schema for the JWT token response."""
    access_token: str
    token_type: str
    user: UserPublic


# --- The Signup Endpoint (You already have this) ---
@router.post("/login", response_model=Token)
async def login_user(form_data: UserLogin):
    """
    Handle user login, check credentials, and return a token.
    """
    
    # 1. Find the user by their email
    user = await User.find_one(User.email == form_data.email)
    
    # 2. Check if user exists (THIS IS THE NEW LOGIC)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            # This is your exact, custom message
            detail="Hey Your Most Welcome to PetCare, please signup first"
        )
        
    # 3. User exists, NOW check the password
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please try again.", # A more specific error
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # 4. If both pass, create a new token
    token_data = {"sub": user.email}
    access_token = create_access_token(data=token_data)
    
    # 5. Create the UserPublic response object
    user_public = UserPublic(
        id=str(user.id),
        name=user.name,
        email=user.email
    )
    
    # 6. Return the token and user info
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_public
    )


# --- 3. NEW LOGIN ENDPOINT ---
@router.post("/login", response_model=Token)
async def login_user(form_data: UserLogin):
    """
    Handle user login, check credentials, and return a token.
    """
    
    # 1. Find the user by their email
    user = await User.find_one(User.email == form_data.email)
    
    # 2. Check if user exists AND if the password is correct
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}, # Standard for login failures
        )
        
    # 3. If password is correct, create a new token
    token_data = {"sub": user.email}
    access_token = create_access_token(data=token_data)
    
    # 4. Create the UserPublic response object
    user_public = UserPublic(
        id=str(user.id),
        name=user.name,
        email=user.email
    )
    
    # 5. Return the token and user info
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_public
    )