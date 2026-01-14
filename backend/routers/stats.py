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
        
        # Calculate active users
        try:
            yesterday = (datetime.now() - timedelta(days=1)).isoformat()
            # Query conversations that have been updated recently (proxy for activity)
            # OR Query messages joined with conversations to get user_id.
            # Simpler: Get active conversations.
            
            # Using Supabase syntax for inner join to get user_id from conversations via messages
            # But deep filtering is complex.
            # Let's just count unique users who have updated their conversations in the last 24h.
            # This captures users who chatted.
            
            active_users_res = supabase.table("conversations").select("user_id")\
                .gte("updated_at", yesterday)\
                .execute()
            
            if active_users_res.data:
                unique_active = set(c['user_id'] for c in active_users_res.data)
                active_now = len(unique_active)
            else:
                active_now = 0
                
        except Exception as e:
            log_error("DB Error fetching active users", e)
            active_now = 0

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
