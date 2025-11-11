from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Main settings class to load all environment variables
    from the .env file.
    """
    
    # --- From database.py ---
    DATABASE_URL: str
    
    # --- From security.py ---
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # --- ADD THIS LINE ---
    GOOGLE_PLACES_API_KEY: str

    class Config:
        env_file = ".env"

# ... (rest of the file is the same)

# Create a single, shared instance that the rest of our app can import
settings = Settings()