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
            return response.data[0]
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
