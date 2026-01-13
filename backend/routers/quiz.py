from fastapi import APIRouter, Depends, HTTPException
from backend.dependencies import get_current_user
from backend.database import supabase
from pydantic import BaseModel

router = APIRouter()

class QuizSubmission(BaseModel):
    score: int

from datetime import date

@router.get("/status")
async def get_quiz_status(user=Depends(get_current_user)):
    try:
        user_id = user.id
        stats = supabase.table("statistics").select("last_quiz_date").eq("user_id", user_id).execute()
        
        today = str(date.today())
        can_take_quiz = True
        
        if stats.data:
            last_date = stats.data[0].get('last_quiz_date')
            if last_date == today:
                can_take_quiz = False
                
        return {"can_take_quiz": can_take_quiz}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit")
async def submit_quiz(submission: QuizSubmission, user=Depends(get_current_user)):
    try:
        user_id = user.id
        today = str(date.today())
        
        # Check if already taken
        stats_res = supabase.table("statistics").select("*").eq("user_id", user_id).execute()
        
        if stats_res.data and stats_res.data[0].get('last_quiz_date') == today:
             raise HTTPException(status_code=400, detail="Bạn đã thực hiện bài trắc nghiệm hôm nay rồi.")

        if not stats_res.data:
            supabase.table("statistics").insert({
                "user_id": user_id, 
                "quiz_score": submission.score,
                "last_quiz_date": today
            }).execute()
        else:
            current_score = stats_res.data[0].get('quiz_score', 0)
            new_score = current_score + submission.score
            supabase.table("statistics").update({
                "quiz_score": new_score,
                "last_quiz_date": today
            }).eq("user_id", user_id).execute()
            
        return {"message": "Score updated", "total_score": new_score if 'new_score' in locals() else submission.score}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/leaderboard")
async def get_leaderboard():
    try:
        # Join with users table to get names
        # Note: Supabase-py postgrest client join syntax can be tricky.
        # Alternatively, we can select from statistics and then fetch user names, 
        # OR if we have a view/foreign key setup correctly.
        # Let's try to fetch statistics order by quiz_score and then fetch user details manually for simplicity/reliability
        
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
        raise HTTPException(status_code=500, detail=str(e))
