from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import auth, chat, stats, user, quiz
import uvicorn

app = FastAPI(
    title="AIchatMLN API",
    description="API for Marx-Lenin Philosophy Chatbot",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:5173",  # Vite default port
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5176",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(stats.router, prefix="/api/statistics", tags=["Statistics"])
app.include_router(user.router, prefix="/api/user", tags=["User"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["Quiz"])

@app.get("/")
async def root():
    return {"message": "Welcome to AIchatMLN API"}

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
