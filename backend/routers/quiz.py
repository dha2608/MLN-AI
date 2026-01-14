from fastapi import APIRouter, Depends, HTTPException
from backend.dependencies import get_current_user
from backend.database import supabase
from pydantic import BaseModel
from datetime import date
from backend.logger import log_info, log_error

router = APIRouter()

class QuizSubmission(BaseModel):
    score: int

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
        response = supabase.table("statistics").select("*").order("quiz_score", desc=True).limit(10).execute()
        
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
