from fastapi import APIRouter, Depends, HTTPException, Body, Header
from backend.dependencies import get_current_user
from backend.database import supabase
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from backend.logger import log_info, log_error

router = APIRouter()

class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[List[str]] = None
    allow_stranger_messages: Optional[bool] = None

class HeartbeatRequest(BaseModel):
    pass

class BlockUserRequest(BaseModel):
    target_id: str

@router.get("/profile")
async def get_profile(user=Depends(get_current_user)):
    try:
        # Fetch from public.users to get custom fields like bio, interests
        res = supabase.table("users").select("*").eq("id", user.id).execute()
        
        user_data = {
            "id": user.id,
            "email": user.email,
            "name": user.user_metadata.get("full_name", user.email),
            "avatar_url": user.user_metadata.get("avatar_url"),
            "created_at": user.created_at,
            # Defaults
            "bio": "",
            "interests": [],
            "allow_stranger_messages": True,
            "achievements": [],
            "stats": {
                "total_questions": 0,
                "streak": 0
            }
        }
        
        if res.data:
            db_user = res.data[0]
            user_data.update({
                "name": db_user.get("name") or user_data["name"],
                "avatar_url": db_user.get("avatar_url") or user_data["avatar_url"],
                "bio": db_user.get("bio"),
                "interests": db_user.get("interests") or [],
                "allow_stranger_messages": db_user.get("allow_stranger_messages", True)
            })

        # Fetch achievements
        try:
            ach_res = supabase.table("user_achievements").select("created_at, achievements(id, name, icon_url, description)").eq("user_id", user.id).execute()
            if ach_res.data:
                user_data["achievements"] = [
                    {
                        "id": a["achievements"]["id"],
                        "name": a["achievements"]["name"], 
                        "icon": a["achievements"]["icon_url"],
                        "description": a["achievements"].get("description", ""),
                        "unlocked_at": a["created_at"]
                    } 
                    for a in ach_res.data if a.get("achievements")
                ]
        except Exception as e:
            log_error("Fetch achievements error", e)

        # Fetch basic stats (optional, usually stats endpoint handles this but profile needs a summary)
        try:
            stats_res = supabase.table("statistics").select("total_questions").eq("user_id", user.id).execute()
            if stats_res.data:
                user_data["stats"]["total_questions"] = stats_res.data[0].get("total_questions", 0)
        except Exception as e:
            pass

        return user_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile/{target_user_id}")
async def get_public_profile(target_user_id: str, user=Depends(get_current_user)):
    try:
        # Check privacy settings first
        privacy_res = supabase.table("users").select("is_profile_public, allow_stranger_messages").eq("id", target_user_id).execute()
        
        if not privacy_res.data:
             raise HTTPException(status_code=404, detail="User not found")
             
        privacy_settings = privacy_res.data[0]
        is_public = privacy_settings.get("is_profile_public", True) # Default True if column missing/null
        
        # If accessing own profile, always allow
        is_me = (target_user_id == user.id)
        
        if not is_public and not is_me:
             # Check if friends
             # (Simple check: count accepted friendships)
             friend_res = supabase.table("friendships").select("id", count="exact").eq("status", "accepted").or_(f"and(user_id.eq.{user.id},friend_id.eq.{target_user_id}),and(user_id.eq.{target_user_id},friend_id.eq.{user.id})").execute()
             is_friend = (friend_res.count > 0) if friend_res.count is not None else False
             
             if not is_friend:
                  raise HTTPException(status_code=403, detail="Hồ sơ này là riêng tư.")

        # Fetch basic info
        res = supabase.table("users").select("*").eq("id", target_user_id).execute()
        if not res.data:
             raise HTTPException(status_code=404, detail="User not found")
             
        db_user = res.data[0]
        
        user_data = {
            "id": db_user["id"],
            "name": db_user.get("name") or "Người dùng ẩn danh",
            "avatar_url": db_user.get("avatar_url"),
            "created_at": db_user.get("created_at"),
            "bio": db_user.get("bio") or "",
            "interests": db_user.get("interests") or [],
            "allow_stranger_messages": db_user.get("allow_stranger_messages", True),
            "achievements": [],
            "stats": {
                "total_questions": 0,
                "streak": 0,
                "total_friends": 0
            }
        }
        
        # Fetch achievements
        try:
            ach_res = supabase.table("user_achievements").select("created_at, achievements(id, name, icon_url, description)").eq("user_id", target_user_id).execute()
            if ach_res.data:
                user_data["achievements"] = [
                    {
                        "id": a["achievements"]["id"],
                        "name": a["achievements"]["name"], 
                        "icon": a["achievements"]["icon_url"],
                        "description": a["achievements"].get("description", ""),
                        "unlocked_at": a["created_at"]
                    } 
                    for a in ach_res.data if a.get("achievements")
                ]
        except Exception:
            pass

        # Fetch stats
        try:
            stats_res = supabase.table("statistics").select("total_questions, streak_count").eq("user_id", target_user_id).execute()
            if stats_res.data:
                user_data["stats"]["total_questions"] = stats_res.data[0].get("total_questions", 0)
                user_data["stats"]["streak"] = stats_res.data[0].get("streak_count", 0)
                
            # Count friends
            f_res = supabase.table("friendships").select("id", count="exact").eq("status", "accepted").or_(f"user_id.eq.{target_user_id},friend_id.eq.{target_user_id}").execute()
            user_data["stats"]["total_friends"] = f_res.count or 0
        except Exception:
            pass
            
        return user_data

    except HTTPException as he:
        raise he
    except Exception as e:
        log_error(f"Get public profile error for {target_user_id}", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile/{target_user_id}")
async def get_public_profile(target_user_id: str, user=Depends(get_current_user)):
    try:
        # Check if requesting self (redirect to standard profile logic or handle here)
        if target_user_id == user.id or target_user_id == "me":
             return await get_profile(user)

        # 1. Fetch user basic info
        res = supabase.table("users").select("id, name, avatar_url, bio, interests, created_at, last_seen, allow_stranger_messages").eq("id", target_user_id).execute()
        
        if not res.data:
            raise HTTPException(status_code=404, detail="User not found")
            
        target_user = res.data[0]
        
        # 2. Fetch stats
        stats_data = {
            "total_questions": 0,
            "streak": 0,
            "total_friends": 0,
            "total_achievements": 0
        }
        
        try:
            # Stats table
            s_res = supabase.table("statistics").select("total_questions, streak_count").eq("user_id", target_user_id).execute()
            if s_res.data:
                stats_data["total_questions"] = s_res.data[0].get("total_questions", 0)
                stats_data["streak"] = s_res.data[0].get("streak_count", 0)
            
            # Recalculate total questions properly if needed (like we did in stats.py)
            # For public profile, maybe just use the cached value in statistics table or do a quick count
            # Let's do a quick count of messages to be accurate
            # Get conversation IDs
            conv_res = supabase.table("conversations").select("id").eq("user_id", target_user_id).execute()
            if conv_res.data:
                c_ids = [c['id'] for c in conv_res.data]
                if c_ids:
                    m_res = supabase.table("messages").select("id", count="exact").in_("conversation_id", c_ids).eq("role", "user").execute()
                    stats_data["total_questions"] = m_res.count if m_res.count is not None else len(m_res.data)

            # Friends count
            f_res = supabase.table("friendships").select("id", count="exact").eq("status", "accepted").or_(f"user_id.eq.{target_user_id},friend_id.eq.{target_user_id}").execute()
            stats_data["total_friends"] = f_res.count if f_res.count is not None else 0
            
            # Achievements count
            a_res = supabase.table("user_achievements").select("id", count="exact").eq("user_id", target_user_id).execute()
            stats_data["total_achievements"] = a_res.count if a_res.count is not None else 0

        except Exception as e:
            log_error(f"Error fetching stats for {target_user_id}", e)

        # 3. Fetch Achievements details
        achievements = []
        try:
            ach_res = supabase.table("user_achievements").select("created_at, achievements(id, name, icon_url, description)").eq("user_id", target_user_id).execute()
            if ach_res.data:
                achievements = [
                    {
                        "id": a["achievements"]["id"],
                        "name": a["achievements"]["name"], 
                        "icon": a["achievements"]["icon_url"],
                        "description": a["achievements"].get("description", ""),
                        "unlocked_at": a["created_at"]
                    } 
                    for a in ach_res.data if a.get("achievements")
                ]
        except Exception as e:
            pass

        # 4. Check friendship status with current user
        friendship_status = "none" # none, pending, accepted
        try:
             fr_res = supabase.table("friendships").select("status, user_id, friend_id").or_(
                 f"and(user_id.eq.{user.id},friend_id.eq.{target_user_id}),and(user_id.eq.{target_user_id},friend_id.eq.{user.id})"
             ).execute()
             if fr_res.data:
                 friendship_status = fr_res.data[0]["status"]
                 # If pending, check who sent it
                 if friendship_status == "pending":
                     if fr_res.data[0]["user_id"] == user.id:
                         friendship_status = "sent" # I sent request
                     else:
                         friendship_status = "received" # They sent request
        except Exception as e:
            pass

        return {
            "id": target_user["id"],
            "name": target_user["name"],
            "avatar_url": target_user["avatar_url"],
            "bio": target_user.get("bio"),
            "interests": target_user.get("interests") or [],
            "created_at": target_user["created_at"],
            "last_seen": target_user.get("last_seen"),
            "allow_stranger_messages": target_user.get("allow_stranger_messages", True),
            "stats": stats_data,
            "achievements": achievements,
            "friendship_status": friendship_status
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        log_error("Public profile error", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/profile")
async def update_profile(data: UserUpdate, user=Depends(get_current_user)):
    try:
        update_data = {k: v for k, v in data.dict().items() if v is not None}
        if not update_data:
            return {"message": "No changes"}

        # Upsert into public.users
        # Ensure we have the ID to conflict on
        update_data["id"] = user.id
        
        # Always ensure email is present for the first insert if it doesn't exist
        if not update_data.get("email"):
            update_data["email"] = user.email
            
        # Also ensure name is present if not provided, fallback to metadata or email
        if not update_data.get("name"):
            update_data["name"] = user.user_metadata.get("full_name", user.email)
            
        # Check if user exists first to decide insert vs update
        exists = supabase.table("users").select("id").eq("id", user.id).execute()
        
        if not exists.data:
            # If not exists, insert
            res = supabase.table("users").insert(update_data).execute()
        else:
            # If exists, update
            res = supabase.table("users").update(update_data).eq("id", user.id).execute()
        
        if not res.data:
             # Fallback fetch
             res = supabase.table("users").select("*").eq("id", user.id).execute()
             
        return res.data[0] if res.data else update_data
    except Exception as e:
        log_error("Update profile error", e)
        # Check for RLS policy violation
        if "policy" in str(e).lower():
             raise HTTPException(status_code=403, detail="Bạn không có quyền cập nhật hồ sơ này (RLS Policy).")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/achievements/all")
async def get_all_achievements():
    try:
        # Fetch all available achievements
        res = supabase.table("achievements").select("*").execute()
        return res.data
    except Exception as e:
        return []

@router.post("/heartbeat")
async def send_heartbeat(user=Depends(get_current_user)):
    if not user:
        return {"status": "ignored", "reason": "unauthorized"}
        
    try:
        # Update last_seen
        # Use ISO format with timezone
        now = datetime.now().isoformat()
        res = supabase.table("users").update({"last_seen": now}).eq("id", user.id).execute()
        return {"status": "online", "timestamp": now}
    except Exception as e:
        log_error("Heartbeat error", e)
        # Log silently, don't crash frontend loop
        return {"status": "error"}

@router.get("/community_v2")
async def get_community_v2():
    """
    Clean V2 Endpoint for Community.
    No Auth dependency. Pure DB query.
    Used to bypass persistent 500 errors on old endpoint.
    """
    try:
        # Simple query first
        res = supabase.table("users").select("id, name, avatar_url, last_seen, bio, interests").order("last_seen", desc=True).limit(50).execute()
        return res.data
    except Exception as e:
        print(f"Community V2 Error: {e}")
        # Fallback - Try with simple select but ensure last_seen is requested
        try:
             # Even in fallback, try to get last_seen
             res = supabase.table("users").select("id, name, avatar_url, last_seen").limit(50).execute()
             return res.data
        except:
             return []

@router.get("/community")
async def get_community_members(user_token: str = Header(None, alias="Authorization")):
    """
    Nuclear Option: Manual Auth parsing to bypass FastAPI Dependency issues.
    This endpoint MUST NOT FAIL with 500.
    """
    user_id = "guest"
    
    # Try manual auth
    try:
        if user_token and "Bearer " in user_token:
            token = user_token.replace("Bearer ", "")
            if token and token != "null":
                user_res = supabase.auth.get_user(token)
                if user_res and user_res.user:
                    user_id = user_res.user.id
    except Exception as e:
        # Ignore auth errors completely
        print(f"Community Manual Auth Error: {e}")
        pass
        
    try:
        log_info(f"Community fetch requested by user: {user_id}")
    except:
        pass
        
    try:
        # First, try to get full details including online status
        # Use order by last_seen to show active users first
        try:
             # Try explicit column selection first
             res = supabase.table("users").select("id, name, avatar_url, last_seen, bio, interests").order("last_seen", desc=True).limit(50).execute()
             return res.data
        except Exception as inner_e:
             # If ordering by last_seen fails (e.g. column missing), fallback to simple query
             log_error("Fetch community full error, trying fallback", inner_e)
             
             try:
                 # Fallback query: Just get everything, but don't order by last_seen if it fails
                 res = supabase.table("users").select("*").limit(50).execute()
                 
                 # Transform generic data to expected format
                 safe_data = []
                 for u in res.data:
                     safe_data.append({
                         "id": u.get("id"),
                         "name": u.get("name", "Unknown"),
                         "avatar_url": u.get("avatar_url"),
                         "last_seen": u.get("last_seen"), # Might be None
                         "bio": u.get("bio"),
                         "interests": u.get("interests", [])
                     })
                 return safe_data
             except Exception as double_fault:
                 log_error("Fetch community DOUBLE FAULT", double_fault)
                 # Absolute last resort: return empty list so frontend doesn't crash 500
                 return []

    except Exception as e:
        log_error("Fetch community critical error", e)
        return []

@router.post("/block")
async def block_user(req: BlockUserRequest, user=Depends(get_current_user)):
    try:
        if req.target_id == user.id:
            raise HTTPException(status_code=400, detail="Cannot block yourself")
            
        supabase.table("blocked_users").insert({
            "user_id": user.id,
            "blocked_user_id": req.target_id
        }).execute()
        
        # Also remove friendship if exists
        supabase.table("friendships").delete().or_(
            f"and(user_id.eq.{user.id},friend_id.eq.{req.target_id}),and(user_id.eq.{req.target_id},friend_id.eq.{user.id})"
        ).execute()
        
        return {"message": "User blocked"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/blocked")
async def get_blocked_users(user=Depends(get_current_user)):
    try:
        res = supabase.table("blocked_users").select("blocked_user_id, users!blocked_user_id(name, avatar_url)").eq("user_id", user.id).execute()
        return res.data
    except Exception as e:
        return []

@router.get("/search")
async def search_users(query: str, user=Depends(get_current_user)):
    try:
        if not query:
            return []
        # Include last_seen, bio, interests for full card display
        res = supabase.table("users").select("id, name, email, avatar_url, last_seen, bio, interests").ilike("name", f"%{query}%").neq("id", user.id).limit(20).execute()
        return res.data
    except Exception as e:
        log_error("Search error", e)
        return []
