from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Create the FastAPI app instance
app = FastAPI(title="PetPal API")

# --- CORS (Cross-Origin Resource Sharing) ---
# This is crucial to allow your Ionic app (running on localhost:8100)
# to communicate with your backend (running on localhost:8000)

origins = [
    "http://localhost:8100",  # Ionic app
    "http://localhost:8101",  # Ionic app (sometimes)
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# --- Test Endpoint ---
# A simple "hello world" route to make sure the server is working

@app.get("/")
async def root():
    return {"message": "Welcome to the PetPal API!"}


# This line allows running the server by typing 'python main.py'
# But 'uvicorn' is the preferred way
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)