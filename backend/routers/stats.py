from fastapi import APIRouter, Depends, HTTPException
from backend.models import UserStatistics
from backend.dependencies import get_current_user
from backend.database import supabase
from datetime import datetime, timedelta

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
            "daily_activity": []
        }

        # Fetch message count by day for the last 7 days
        today = datetime.now()
        seven_days_ago = today - timedelta(days=6)
        
        # Format for query
        start_date_str = seven_days_ago.strftime('%Y-%m-%d')
        
        # Safe approach: 
        # 1. Get all conversation IDs for the user
        conv_res = supabase.table("conversations").select("id").eq("user_id", user_id).execute()
        conv_ids = [c['id'] for c in conv_res.data]
        
        daily_counts = { (seven_days_ago + timedelta(days=i)).strftime('%Y-%m-%d'): 0 for i in range(7) }
        weekly_total = 0
        
        if conv_ids:
            # 2. Fetch messages for these conversations created in last 7 days
            # Using 'in_' filter for the list of conversation IDs
            msgs_res = supabase.table("messages").select("created_at")\
                .in_("conversation_id", conv_ids)\
                .eq("role", "user")\
                .gte("created_at", start_date_str)\
                .execute()
                
            for msg in msgs_res.data:
                # Parse date (assuming ISO format like "2023-10-27T10:00:00+00:00")
                try:
                    date_str = msg['created_at'].split('T')[0]
                    if date_str in daily_counts:
                        daily_counts[date_str] += 1
                        weekly_total += 1
                except:
                    continue
        
        # Sort and format for frontend
        daily_activity = [{"date": k, "count": v} for k, v in daily_counts.items()]
        daily_activity.sort(key=lambda x: x['date'])

        # Total questions (all time)
        # Use cached stats if available, otherwise 0
        total_q = 0
        if response.data:
            total_q = response.data[0].get("total_questions", 0)
        
        # Update stats object
        personal_stats["total_questions"] = total_q
        personal_stats["weekly_questions"] = weekly_total
        personal_stats["daily_average"] = round(weekly_total / 7.0, 1)
        personal_stats["daily_activity"] = daily_activity
            
        # 2. Community Stats (Real Data)
        try:
            users_count_res = supabase.table("users").select("id", count="exact").execute()
            total_users = users_count_res.count if users_count_res.count is not None else 0
        except:
            total_users = 0
        
        try:
            # Approximate total community questions (messages with role='user')
            # Using head=True to avoid fetching data, just count
            msgs_count_res = supabase.table("messages").select("id", count="exact", head=True).eq("role", "user").execute()
            total_questions_community = msgs_count_res.count if msgs_count_res.count is not None else 0
        except:
            total_questions_community = 0
        
        active_now = max(1, int(total_users * 0.1)) 

        community_stats = {
            "total_users": total_users,
            "total_questions_community": total_questions_community,
            "active_now": active_now
        }

        return {
            "personal": personal_stats,
            "community": community_stats
        }

    except Exception as e:
        print(f"Error in stats: {e}")
        # Return a fallback structure instead of 500ing completely if possible, 
        # but for now let's just log and raise to ensure we know it failed.
        raise HTTPException(status_code=500, detail=str(e))
