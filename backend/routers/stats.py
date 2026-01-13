from fastapi import APIRouter, Depends, HTTPException
from backend.models import UserStatistics
from backend.dependencies import get_current_user
from backend.database import supabase

router = APIRouter()

@router.get("/overview")
async def get_statistics(user=Depends(get_current_user)):
    try:
        user_id = user.id
        
        # 1. Personal Stats
        response = supabase.table("statistics").select("*").eq("user_id", user_id).execute()
        
        personal_stats = {
            "total_questions": 0,
            "weekly_questions": 0,
            "daily_average": 0.0,
            "top_topics": []
        }

        if response.data:
            data = response.data[0]
            personal_stats = {
                "total_questions": data.get("total_questions", 0),
                "weekly_questions": data.get("weekly_questions", 0),
                "daily_average": round(data.get("total_questions", 0) / 7.0, 1), # Simplified avg
                "top_topics": data.get("top_topics") or []
            }
            
        # 2. Community Stats (Fake Data as requested)
        # We start with a base number and add the real user count if possible, or just random flux
        # For simplicity and "feeling like >10 users", we hardcode a base + some dynamic aspect
        
        # Get total users count from DB (users table)
        users_count_res = supabase.table("users").select("id", count="exact").execute()
        real_user_count = users_count_res.count if users_count_res.count else 0
        
        fake_base_users = 14
        total_users_display = fake_base_users + real_user_count
        
        community_stats = {
            "total_users": total_users_display,
            "total_questions_community": 1240 + (personal_stats["total_questions"] * 5),
            "active_now": 3
        }

        return {
            "personal": personal_stats,
            "community": community_stats
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
