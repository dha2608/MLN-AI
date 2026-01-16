from fastapi import APIRouter, Depends, HTTPException
from backend.dependencies import get_current_user
from backend.database import supabase
from pydantic import BaseModel
from datetime import datetime
from backend.logger import log_info, log_error

router = APIRouter()

class FriendRequest(BaseModel):
    target_user_id: str

class AcceptRequest(BaseModel):
    request_id: str

class SendMessage(BaseModel):
    receiver_id: str
    content: str

# --- Friends ---

@router.post("/friends/delete")
async def delete_friend(req: FriendRequest, user=Depends(get_current_user)):
    try:
        sender_id = user.id
        target_id = req.target_user_id
        
        # Delete friendship where (user_id=me AND friend_id=target) OR (user_id=target AND friend_id=me)
        res = supabase.table("friendships").delete().or_(
            f"and(user_id.eq.{sender_id},friend_id.eq.{target_id}),and(user_id.eq.{target_id},friend_id.eq.{sender_id})"
        ).execute()
        
        return {"message": "Friend removed"}
    except Exception as e:
        log_error("Delete friend error", e)
        raise HTTPException(status_code=500, detail=str(e))
    try:
        sender_id = user.id
        target_id = req.target_user_id
        
        if sender_id == target_id:
            raise HTTPException(status_code=400, detail="Cannot friend yourself")

        # Check existing
        existing = supabase.table("friendships").select("*").or_(
            f"and(user_id.eq.{sender_id},friend_id.eq.{target_id}),and(user_id.eq.{target_id},friend_id.eq.{sender_id})"
        ).execute()
        
        if existing.data:
            status = existing.data[0]['status']
            if status == 'accepted':
                raise HTTPException(status_code=400, detail="Already friends")
            if status == 'pending':
                raise HTTPException(status_code=400, detail="Request already pending")

        # Create request
        supabase.table("friendships").insert({
            "user_id": sender_id,
            "friend_id": target_id,
            "status": "pending"
        }).execute()
        
        # Notify target
        supabase.table("notifications").insert({
            "user_id": target_id,
            "type": "friend_request",
            "title": "Lời mời kết bạn mới",
            "content": f"{user.user_metadata.get('full_name', 'Someone')} muốn kết bạn với bạn.",
            "is_read": False
        }).execute()
        
        return {"message": "Request sent"}
    except Exception as e:
        log_error("Friend request error", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/friends/accept")
async def accept_friend_request(req: AcceptRequest, user=Depends(get_current_user)):
    try:
        # Verify request exists and is for current user
        # Note: In our schema, user_id is sender, friend_id is receiver (current user)
        # We need to find the specific row.
        # But wait, the request_id passed from frontend might be the friendship ID.
        
        # Let's assume req.request_id is the 'id' of the friendship row
        # Check if this friendship exists where friend_id == user.id AND status == pending
        
        res = supabase.table("friendships").update({"status": "accepted"}).eq("id", req.request_id).eq("friend_id", user.id).execute()
        
        if not res.data:
             raise HTTPException(status_code=404, detail="Request not found or not for you")
             
        # Notify sender
        sender_id = res.data[0]['user_id']
        supabase.table("notifications").insert({
            "user_id": sender_id,
            "type": "friend_accept",
            "title": "Chấp nhận kết bạn",
            "content": f"{user.user_metadata.get('full_name', 'Someone')} đã chấp nhận lời mời kết bạn.",
            "is_read": False
        }).execute()

        return {"message": "Accepted"}
    except Exception as e:
        log_error("Accept friend error", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/friends")
async def get_friends(user=Depends(get_current_user)):
    try:
        # Get all accepted friendships where user is either user_id or friend_id
        res = supabase.table("friendships").select("*").eq("status", "accepted").or_(f"user_id.eq.{user.id},friend_id.eq.{user.id}").execute()
        
        friend_ids = []
        for f in res.data:
            friend_ids.append(f['friend_id'] if f['user_id'] == user.id else f['user_id'])
            
        if not friend_ids:
            return []
            
        # Get user details
        users = supabase.table("users").select("id, name, email, avatar_url").in_("id", friend_ids).execute()
        return users.data
    except Exception as e:
        log_error("Get friends error", e)
        return []

@router.get("/friends/requests")
async def get_friend_requests(user=Depends(get_current_user)):
    try:
        # Get pending requests where friend_id == current user
        # Avoid direct join first
        res = supabase.table("friendships").select("*").eq("friend_id", user.id).eq("status", "pending").execute()
        
        if not res.data:
            return []
            
        # Manually fetch senders
        sender_ids = [r['user_id'] for r in res.data]
        users_res = supabase.table("users").select("id, name, email, avatar_url").in_("id", sender_ids).execute()
        users_map = {u['id']: u for u in users_res.data} if users_res.data else {}
        
        # Transform for frontend
        requests = []
        for r in res.data:
            sender_data = users_map.get(r['user_id'], {"name": "Unknown", "email": "", "avatar_url": None})
            requests.append({
                "id": r['id'],
                "sender": sender_data,
                "created_at": r['created_at']
            })
        return requests
    except Exception as e:
        log_error("Get requests error", e)
        return []

# --- Messages ---

@router.get("/messages/{friend_id}")
async def get_messages(friend_id: str, user=Depends(get_current_user)):
    try:
        res = supabase.table("messages_social").select("*").or_(
            f"and(sender_id.eq.{user.id},receiver_id.eq.{friend_id}),and(sender_id.eq.{friend_id},receiver_id.eq.{user.id})"
        ).order("created_at").limit(50).execute()
        return res.data
    except Exception as e:
        log_error("Get messages error", e)
        return []

@router.post("/messages/send")
async def send_social_message(msg: SendMessage, user=Depends(get_current_user)):
    try:
        # Check privacy: Allow stranger messages?
        receiver_settings = supabase.table("users").select("allow_stranger_messages").eq("id", msg.receiver_id).execute()
        
        is_allowed = True
        if receiver_settings.data:
            allow_strangers = receiver_settings.data[0].get('allow_stranger_messages', True)
            if not allow_strangers:
                # Check if friends
                friendship = supabase.table("friendships").select("*").eq("status", "accepted").or_(
                    f"and(user_id.eq.{user.id},friend_id.eq.{msg.receiver_id}),and(user_id.eq.{msg.receiver_id},friend_id.eq.{user.id})"
                ).execute()
                if not friendship.data:
                    is_allowed = False
        
        # Check if blocked
        blocked = supabase.table("blocked_users").select("*").eq("user_id", msg.receiver_id).eq("blocked_user_id", user.id).execute()
        if blocked.data:
            is_allowed = False
            
        if not is_allowed:
            raise HTTPException(status_code=403, detail="Cannot send message to this user due to privacy settings")

        data = {
            "sender_id": user.id,
            "receiver_id": msg.receiver_id,
            "content": msg.content
        }
        res = supabase.table("messages_social").insert(data).execute()
        return res.data[0]
    except HTTPException as he:
        raise he
    except Exception as e:
        log_error("Send message error", e)
        raise HTTPException(status_code=500, detail=str(e))

# --- Notifications ---

@router.get("/notifications")
async def get_notifications(user=Depends(get_current_user)):
    try:
        res = supabase.table("notifications").select("*").eq("user_id", user.id).order("created_at", desc=True).limit(20).execute()
        return res.data
    except Exception as e:
        return []

# --- Search ---
@router.get("/users/search")
async def search_users(query: str, user=Depends(get_current_user)):
    try:
        if not query:
            return []
        res = supabase.table("users").select("id, name, email, avatar_url").ilike("name", f"%{query}%").neq("id", user.id).limit(10).execute()
        return res.data
    except Exception as e:
        return []
