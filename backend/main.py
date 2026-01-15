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
app.include_router(social.router, prefix="/api/social", tags=["social"])

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

@app.get("/api/debug")
def debug_endpoint():
    import sys
    import httpx
    import supabase as sb_module
    from backend.database import supabase, init_error
    
    # Check env vars
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "") or os.environ.get("SUPABASE_KEY", "")
    
    # Check client status
    client_status = "Unknown"
    client_error = None
    try:
        # Check if it's our DummyClient
        if type(supabase).__name__ == "DummyClient":
             client_status = "DummyClient (Initialization Failed)"
             client_error = init_error
        else:
             client_status = "Initialized"
    except Exception as e:
        client_status = f"Error checking client: {e}"

    # Try connection
    conn_result = "Not attempted"
    if client_status == "Initialized":
        try:
            # Simple query
            res = supabase.table("users").select("count", count="exact").execute()
            conn_result = f"Success. Data: {res}"
        except Exception as e:
            conn_result = f"Failed: {e}"
            client_error = str(e)

    return {
        "python_version": sys.version,
        "packages": {
            "httpx": httpx.__version__,
            "supabase": sb_module.__version__ if hasattr(sb_module, "__version__") else "unknown"
        },
        "env": {
            "SUPABASE_URL": f"{url[:10]}..." if url else "MISSING",
            "SUPABASE_KEY_SET": bool(key),
            "NO_PROXY": os.environ.get("NO_PROXY"),
            "HTTP_PROXY": os.environ.get("HTTP_PROXY"),
            "HTTPS_PROXY": os.environ.get("HTTPS_PROXY")
        },
        "client_status": client_status,
        "connection_test": conn_result,
        "last_error": client_error
    }
