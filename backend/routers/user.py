from fastapi import APIRouter, Depends, HTTPException, Body
from backend.dependencies import get_current_user
from backend.database import supabase
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

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
            "allow_stranger_messages": True
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
            
        return user_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/profile")
async def update_profile(data: UserUpdate, user=Depends(get_current_user)):
    try:
        update_data = {k: v for k, v in data.dict().items() if v is not None}
        if not update_data:
            return {"message": "No changes"}

        # Upsert into public.users
        # Note: 'email' is usually unique/PK depending on setup, but 'id' is definitely PK.
        update_data["id"] = user.id
        
        # We don't need to force email update if it's not provided, but ensuring it exists is good.
        if not update_data.get("email"):
            update_data["email"] = user.email
        
        res = supabase.table("users").upsert(update_data).execute()
        
        if not res.data:
             # Fallback: if upsert fails to return data (sometimes happens with policies), fetch it
             res = supabase.table("users").select("*").eq("id", user.id).execute()
             
        return res.data[0] if res.data else update_data
    except Exception as e:
        log_error("Update profile error", e)
        # Check for RLS policy violation
        if "policy" in str(e).lower():
             raise HTTPException(status_code=403, detail="Bạn không có quyền cập nhật hồ sơ này (RLS Policy).")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/heartbeat")
async def send_heartbeat(user=Depends(get_current_user)):
    try:
        # Update last_seen
        supabase.table("users").update({"last_seen": datetime.now().isoformat()}).eq("id", user.id).execute()
        return {"status": "online"}
    except Exception as e:
        # Log silently, don't crash frontend loop
        return {"status": "error"}

@router.get("/community")
async def get_community_members(user=Depends(get_current_user)):
    try:
        # Get all users, ordered by last_seen (most recent first)
        # We select specific columns to avoid errors if some columns are missing
        # Also, if last_seen is missing, it will just be null, which is fine
        try:
             res = supabase.table("users").select("id, name, avatar_url, last_seen, bio, interests").order("created_at", desc=True).limit(50).execute()
             return res.data
        except Exception as inner_e:
             # Fallback if specific columns fail (e.g. last_seen not created yet)
             log_error("Fetch community full error, trying fallback", inner_e)
             # Try simplest query
             res = supabase.table("users").select("*").limit(50).execute()
             
             # Transform generic data to expected format
             safe_data = []
             for u in res.data:
                 safe_data.append({
                     "id": u.get("id"),
                     "name": u.get("name", "Unknown"),
                     "avatar_url": u.get("avatar_url"),
                     "last_seen": u.get("last_seen"),
                     "bio": u.get("bio"),
                     "interests": u.get("interests", [])
                 })
             return safe_data
    except Exception as e:
        log_error("Fetch community critical error", e)
        # Even if DB fails completely, return empty list instead of 500 to keep UI alive
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
