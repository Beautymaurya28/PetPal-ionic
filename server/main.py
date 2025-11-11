from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager
import httpx  # <-- Import httpx

# Import your routers
from pets import router as pets_router
from database import init_db
from auth import router as auth_router # <-- Assuming you have this
from vets import router as vets_router
from health import router as health_router # <-- Assuming you have this
from reminders import router as reminders_router # <-- Assuming you have this

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code to run on startup
    await init_db()
    # Create a single, re-usable HTTP client for the app's lifetime
    app.state.http_client = httpx.AsyncClient() 
    
    yield
    
    # Code to run on shutdown
    await app.state.http_client.aclose() # Cleanly close the client
    print("Server shutting down...")

# Create the FastAPI app instance
app = FastAPI(title="PetPal API", lifespan=lifespan)

# --- CORS (Cross-Origin Resource Sharing) ---
origins = [
    "http://localhost:8100",  # Ionic app
    "http://localhost:8101",  # Ionic app (sometimes)
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include Routers ---
# Now, we add all the routers you've imported
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(pets_router, prefix="/api/pets", tags=["Pets"])
app.include_router(vets_router, prefix="/api/vets", tags=["Vets & Maps"])
app.include_router(reminders_router, prefix="/api/reminders", tags=["Reminders"])
app.include_router(health_router, prefix="/api/health", tags=["Health"])


# --- Test Endpoint ---
@app.get("/")
async def root():
    return {"message": "Welcome to the PetPal API!"}

# --- Run Server ---
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)