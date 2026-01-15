from fastapi import APIRouter, Depends, HTTPException, Body
from backend.dependencies import get_current_user
from backend.database import supabase
from pydantic import BaseModel
from datetime import date
from backend.logger import log_info, log_error
import os
import json
import openai
import random
import string
from typing import List, Optional

router = APIRouter()

class CreateMatchRequest(BaseModel):
    mode: str = "pvp" # pvp or coop

class JoinMatchRequest(BaseModel):
    room_code: str

class UpdateScoreRequest(BaseModel):
    match_id: str
    score: int

def generate_room_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

# --- Matchmaking / Lobby ---

@router.post("/match/create")
async def create_match(req: CreateMatchRequest, user=Depends(get_current_user)):
    try:
        room_code = generate_room_code()
        
        # Create match
        match_res = supabase.table("quiz_matches").insert({
            "room_code": room_code,
            "host_id": user.id,
            "mode": req.mode,
            "status": "waiting"
        }).execute()
        
        match_id = match_res.data[0]['id']
        
        # Add host as participant
        supabase.table("match_participants").insert({
            "match_id": match_id,
            "user_id": user.id,
            "status": "ready"
        }).execute()
        
        return {"match_id": match_id, "room_code": room_code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/match/join")
async def join_match(req: JoinMatchRequest, user=Depends(get_current_user)):
    try:
        # Find match
        match_res = supabase.table("quiz_matches").select("*").eq("room_code", req.room_code).eq("status", "waiting").execute()
        if not match_res.data:
            raise HTTPException(status_code=404, detail="Room not found or game started")
        
        match_id = match_res.data[0]['id']
        
        # Check if already joined
        existing = supabase.table("match_participants").select("*").eq("match_id", match_id).eq("user_id", user.id).execute()
        if existing.data:
            return {"match_id": match_id, "room_code": req.room_code, "message": "Rejoined"}

        # Join
        supabase.table("match_participants").insert({
            "match_id": match_id,
            "user_id": user.id,
            "status": "joined"
        }).execute()
        
        return {"match_id": match_id, "room_code": req.room_code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/match/{match_id}")
async def get_match_state(match_id: str, user=Depends(get_current_user)):
    try:
        match_data = supabase.table("quiz_matches").select("*").eq("id", match_id).execute()
        if not match_data.data:
            raise HTTPException(status_code=404, detail="Match not found")
            
        participants = supabase.table("match_participants").select("*, users(name, avatar_url)").eq("match_id", match_id).execute()
        
        return {
            "match": match_data.data[0],
            "participants": participants.data
        }
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

@router.post("/match/{match_id}/start")
async def start_match(match_id: str, user=Depends(get_current_user)):
    try:
        # Verify host
        match_res = supabase.table("quiz_matches").select("*").eq("id", match_id).eq("host_id", user.id).execute()
        if not match_res.data:
             raise HTTPException(status_code=403, detail="Only host can start")
        
        # Update status
        supabase.table("quiz_matches").update({"status": "playing"}).eq("id", match_id).execute()
        return {"message": "Started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/match/score")
async def update_match_score(req: UpdateScoreRequest, user=Depends(get_current_user)):
    try:
        supabase.table("match_participants").update({"score": req.score}).eq("match_id", req.match_id).eq("user_id", user.id).execute()
        return {"message": "Score updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class QuizSubmission(BaseModel):
    score: int

@router.get("/generate")
async def generate_quiz(user=Depends(get_current_user)):
    try:
        log_info(f"Generating quiz for user {user.id}")
        
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
             log_error("OpenAI API Key missing")
             return {"questions": []} # Fallback to frontend pool

        client = openai.OpenAI(api_key=openai_api_key)
        
        prompt = """
        Hãy tạo ra 5 câu hỏi trắc nghiệm về Triết học Mác - Lênin (Marxist-Leninist Philosophy).
        Mỗi câu hỏi có 4 đáp án (A, B, C, D).
        Chỉ định rõ đáp án đúng (index 0-3).
        Giải thích ngắn gọn tại sao đáp án đó đúng.
        
        Trả về kết quả dưới dạng JSON thuần túy (không markdown) với cấu trúc mảng:
        [
            {
                "id": 1,
                "question": "Nội dung câu hỏi...",
                "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
                "correct": 0,
                "explanation": "Giải thích..."
            }
        ]
        Đảm bảo kiến thức chính xác, học thuật.
        """

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Bạn là một giảng viên triết học Mác - Lênin. Bạn chỉ trả về JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" }
        )
        
        content = completion.choices[0].message.content
        data = json.loads(content)
        
        # Handle cases where GPT wraps in a key like "questions": [...]
        questions = data.get("questions", data)
        if isinstance(questions, list):
             return {"questions": questions}
        
        return {"questions": []}

    except Exception as e:
        log_error("Quiz generation error", e)
        # Return empty so frontend uses fallback
        return {"questions": []}

@router.get("/status")
async def get_quiz_status(user=Depends(get_current_user)):
    try:
        user_id = user.id
        log_info(f"Checking quiz status for {user_id}")
        stats = supabase.table("statistics").select("last_quiz_date").eq("user_id", user_id).execute()
        
        today = str(date.today())
        can_take_quiz = True
        
        if stats.data:
            last_date = stats.data[0].get('last_quiz_date')
            if last_date == today:
                can_take_quiz = False
                
        return {"can_take_quiz": can_take_quiz}
    except Exception as e:
        log_error("Error checking quiz status", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit")
async def submit_quiz(submission: QuizSubmission, user=Depends(get_current_user)):
    try:
        user_id = user.id
        today = str(date.today())
        log_info(f"Submitting quiz for {user_id}, score: {submission.score}")
        
        # 0. Ensure user exists in public.users (Critical for Leaderboard joins)
        try:
            check_user = supabase.table("users").select("id").eq("id", user_id).execute()
            if not check_user.data:
                user_metadata = user.user_metadata or {}
                email_val = user.email or f"no-email-{user_id}@example.com"
                name_val = user_metadata.get('full_name') or user_metadata.get('name') or email_val.split('@')[0]
                user_data = {
                    "id": user_id,
                    "email": email_val,
                    "name": name_val,
                    "avatar_url": user_metadata.get('avatar_url'),
                    "password_hash": "google_oauth" # Dummy value to satisfy NOT NULL constraint
                }
                supabase.table("users").insert(user_data).execute()
        except Exception as e:
            log_error("User sync error in quiz", e)

        # Check if already taken
        stats_res = supabase.table("statistics").select("*").eq("user_id", user_id).execute()
        
        if stats_res.data and stats_res.data[0].get('last_quiz_date') == today:
             log_info("Quiz already taken today")
             raise HTTPException(status_code=400, detail="Bạn đã thực hiện bài trắc nghiệm hôm nay rồi.")

        if not stats_res.data:
            supabase.table("statistics").insert({
                "user_id": user_id, 
                "quiz_score": submission.score,
                "last_quiz_date": today,
                "total_questions": 0 # Initialize if missing
            }).execute()
        else:
            current_score = stats_res.data[0].get('quiz_score', 0) or 0 # Handle None
            new_score = current_score + submission.score
            supabase.table("statistics").update({
                "quiz_score": new_score,
                "last_quiz_date": today
            }).eq("user_id", user_id).execute()
            
        log_info("Quiz submitted successfully")
        return {"message": "Score updated", "total_score": new_score if 'new_score' in locals() else submission.score}

    except HTTPException as he:
        raise he
    except Exception as e:
        log_error("Quiz submission critical error", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/leaderboard")
async def get_leaderboard():
    try:
        log_info("Fetching leaderboard")
        # Join with users table to get names
        response = supabase.table("statistics").select("*").order("quiz_score", desc=True).limit(50).execute()
        
        leaderboard = []
        for stat in response.data:
            user_id = stat['user_id']
            # Fetch user name from public.users table
            user_res = supabase.table("users").select("name, avatar_url").eq("id", user_id).execute()
            user_data = user_res.data[0] if user_res.data else {"name": "Unknown", "avatar_url": None}
            
            leaderboard.append({
                "user_id": user_id,
                "score": stat.get('quiz_score', 0),
                "name": user_data.get('name') or "Người dùng ẩn danh",
                "avatar_url": user_data.get('avatar_url')
            })
            
        return leaderboard

    except Exception as e:
        log_error("Leaderboard fetch error", e)
        raise HTTPException(status_code=500, detail=str(e))
