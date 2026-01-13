from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

# Auth Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    user_id: str
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

# Chat Models
class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    system_instruction: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    timestamp: datetime

# Stats Models
class UserStatistics(BaseModel):
    total_questions: int
    weekly_questions: int
    daily_average: float
    top_topics: List[str]

# DB Models (simplified for Pydantic usage, though we use Supabase client directly)
class User(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    avatar_url: Optional[str]
    created_at: datetime
