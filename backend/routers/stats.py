from fastapi import APIRouter, Depends, HTTPException
from backend.models import UserStatistics
from backend.dependencies import get_current_user
from backend.database import supabase
from datetime import datetime, timedelta
from backend.logger import log_info, log_error

router = APIRouter()

@router.get("/overview")
async def get_statistics(user=Depends(get_current_user)):
    try:
        user_id = user.id
        log_info(f"Fetching stats for user: {user_id}")
        
        # 1. Personal Stats
        try:
            response = supabase.table("statistics").select("*").eq("user_id", user_id).execute()
        except Exception as e:
            log_error("DB Error fetching personal stats", e)
            response = None
        
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
        try:
            conv_res = supabase.table("conversations").select("id").eq("user_id", user_id).execute()
            conv_ids = [c['id'] for c in conv_res.data]
        except Exception as e:
            log_error("DB Error fetching conversations", e)
            conv_ids = []
        
        daily_counts = { (seven_days_ago + timedelta(days=i)).strftime('%Y-%m-%d'): 0 for i in range(7) }
        weekly_total = 0
        
        if conv_ids:
            # 2. Fetch messages for these conversations created in last 7 days
            try:
                msgs_res = supabase.table("messages").select("created_at")\
                    .in_("conversation_id", conv_ids)\
                    .eq("role", "user")\
                    .gte("created_at", start_date_str)\
                    .execute()
                    
                for msg in msgs_res.data:
                    try:
                        date_str = msg['created_at'].split('T')[0]
                        if date_str in daily_counts:
                            daily_counts[date_str] += 1
                            weekly_total += 1
                    except:
                        continue
            except Exception as e:
                log_error("DB Error fetching messages", e)
        
        # Sort and format for frontend
        daily_activity = [{"date": k, "count": v} for k, v in daily_counts.items()]
        daily_activity.sort(key=lambda x: x['date'])

        # Total questions (all time)
        total_q = 0
        if response and response.data:
            total_q = response.data[0].get("total_questions", 0)
        
        personal_stats["total_questions"] = total_q
        personal_stats["weekly_questions"] = weekly_total
        personal_stats["daily_average"] = round(weekly_total / 7.0, 1)
        personal_stats["daily_activity"] = daily_activity
            
        # 2. Community Stats (Real Data)
        try:
            # Use count='exact' and fetch minimal data (id) to count. 
            # Note: postgrest-py doesn't support head=True in select() args in some versions.
            users_count_res = supabase.table("users").select("id", count="exact").execute()
            total_users = users_count_res.count if users_count_res.count is not None else len(users_count_res.data)
        except Exception as e:
            log_error("DB Error fetching total users", e)
            total_users = 0
        
        try:
            msgs_count_res = supabase.table("messages").select("id", count="exact").eq("role", "user").execute()
            total_questions_community = msgs_count_res.count if msgs_count_res.count is not None else len(msgs_count_res.data)
        except Exception as e:
            log_error("DB Error fetching total questions", e)
            total_questions_community = 0
        
        # Calculate active users (Last seen < 1 hour)
        try:
            one_hour_ago = (datetime.now() - timedelta(hours=1)).isoformat()
            # Count users with last_seen > 1 hour ago
            active_users_res = supabase.table("users").select("id", count="exact").gt("last_seen", one_hour_ago).execute()
            
            if active_users_res.count is not None:
                active_now = active_users_res.count
            else:
                active_now = len(active_users_res.data)
                
        except Exception as e:
            log_error("DB Error fetching active users", e)
            active_now = 0

        # Friends & Achievements Stats
        friends_count = 0
        achievements_count = 0
        try:
            # Count accepted friendships
            # Correct logic: user is either user_id or friend_id
            f_res = supabase.table("friendships").select("id", count="exact").eq("status", "accepted").or_(f"user_id.eq.{user_id},friend_id.eq.{user_id}").execute()
            friends_count = f_res.count if f_res.count is not None else len(f_res.data)
            
            # Count unlocked achievements
            a_res = supabase.table("user_achievements").select("id", count="exact").eq("user_id", user_id).execute()
            achievements_count = a_res.count if a_res.count is not None else len(a_res.data)
        except Exception as e:
            log_error("DB Error fetching personal extras", e)

        community_stats = {
            "total_users": total_users,
            "total_questions_community": total_questions_community,
            "active_now": active_now
        }
        
        # Add to personal stats
        personal_stats["total_friends"] = friends_count
        personal_stats["total_achievements"] = achievements_count

        return {
            "personal": personal_stats,
            "community": community_stats
        }

    except Exception as e:
        log_error("Stats Critical Error", e)
        return {
            "personal": {
                "total_questions": 0,
                "weekly_questions": 0,
                "daily_average": 0.0,
                "daily_activity": []
            },
            "community": {
                "total_users": 0,
                "total_questions_community": 0,
                "active_now": 0
            }
        }
