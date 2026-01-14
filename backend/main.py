from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import auth, chat, stats, user, quiz
import os

print("Starting FastAPI app...") # Debug log for Vercel

app = FastAPI()

# Get allowed origins from environment variable, default to localhost for dev
# In production (Vercel), this should be the frontend URL
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://your-vercel-app-url.vercel.app" # User should replace this
]

# Allow all origins for now to simplify Vercel deployment if domain is unknown
# In strict production, specific domains should be used.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(stats.router, prefix="/api/statistics", tags=["statistics"])
app.include_router(user.router, prefix="/api/user", tags=["user"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Chat Philosophy API"}

@app.get("/api/health")
def health_check():
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")
    
    status_info = {
        "status": "ok",
        "env_check": {
            "SUPABASE_URL": "Set" if supabase_url else "Missing",
            "SUPABASE_KEY": "Set" if supabase_key else "Missing"
        }
    }
    return status_info
