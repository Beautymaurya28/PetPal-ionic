import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from models import User # <-- We need to fetch the user
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt

# 1. Import our new central settings
from config import settings
# This tells FastAPI to look for an Authorization header
# tokenUrl="api/auth/login" just tells the docs "this is the login endpoint"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


# 2. --- Password Hashing Functions ---

def hash_password(password: str) -> str:
    """Hashes a plain-text password using bcrypt."""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password=pwd_bytes, salt=salt)
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks if a plain-text password matches a stored hash."""
    password_bytes = plain_password.encode('utf-8')
    hashed_password_bytes = hashed_password.encode('utf-8')
    
    try:
        return bcrypt.checkpw(
            password=password_bytes, 
            hashed_password=hashed_password_bytes
        )
    except ValueError:
        return False


# 3. --- JWT Token Functions ---
# (These functions now use the imported 'settings' object)

def create_access_token(data: dict) -> str:
    """Creates a new JWT access token."""
    to_encode = data.copy()
    
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt

def decode_access_token(token: str):
    """Decodes a JWT token and returns the payload (data)."""
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        return payload.get("sub")
    except JWTError:
        return None
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    Dependency to get the current user from a JWT token.
    This protects our routes and identifies the user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    email = decode_access_token(token)
    if email is None:
        raise credentials_exception
        
    user = await User.find_one(User.email == email)
    if user is None:
        raise credentials_exception
        
    return user