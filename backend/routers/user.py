from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from backend.dependencies import get_current_user
from backend.database import supabase

router = APIRouter()

@router.get("/profile")
async def get_profile(user=Depends(get_current_user)):
    try:
        # Get from public.users table
        response = supabase.table("users").select("*").eq("id", user.id).execute()
        if response.data:
            user_data = response.data[0]
            # Sync with Supabase Auth metadata if public.users is outdated or empty
            # But primarily we trust the database record. 
            # If avatar is missing in DB but exists in Auth (Google login), we could sync it here.
            if not user_data.get('avatar_url') and user.user_metadata.get('avatar_url'):
                 # Auto-update avatar from Google
                 avatar = user.user_metadata.get('avatar_url')
                 supabase.table("users").update({"avatar_url": avatar}).eq("id", user.id).execute()
                 user_data['avatar_url'] = avatar
            
            if not user_data.get('name') and user.user_metadata.get('full_name'):
                 name = user.user_metadata.get('full_name')
                 supabase.table("users").update({"name": name}).eq("id", user.id).execute()
                 user_data['name'] = name

            return user_data
            
        # If no record in public.users (rare if trigger works, but possible)
        # Create one from Auth data
        new_user = {
            "id": user.id,
            "email": user.email,
            "name": user.user_metadata.get('full_name') or user.user_metadata.get('name') or user.email.split('@')[0],
            "avatar_url": user.user_metadata.get('avatar_url')
        }
        try:
            supabase.table("users").insert(new_user).execute()
            return new_user
        except:
            return {"email": user.email, "id": user.id} # Fallback
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel

class UserUpdate(BaseModel):
    name: str

@router.put("/profile")
async def update_profile(user_data: UserUpdate, user=Depends(get_current_user)):
    try:
        supabase.table("users").update({"name": user_data.name}).eq("id", user.id).execute()
        return {"message": "Profile updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/avatar")
async def upload_avatar(file: UploadFile = File(...), user=Depends(get_current_user)):
    try:
        file_content = await file.read()
        file_path = f"avatars/{user.id}/{file.filename}"
        
        # Upload to Supabase Storage
        supabase.storage.from_("avatars").upload(
            file_path,
            file_content,
            {"content-type": file.content_type, "upsert": "true"}
        )
        
        # Get Public URL
        public_url = supabase.storage.from_("avatars").get_public_url(file_path)
        
        # Update User Profile
        supabase.table("users").update({"avatar_url": public_url}).eq("id", user.id).execute()
        
        return {"avatar_url": public_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
