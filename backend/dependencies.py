from fastapi import Header, HTTPException, status
from backend.database import supabase

async def get_current_user(authorization: str = Header(None)):
    """
    Verifies the JWT token from Supabase.
    Returns the user object if valid, None otherwise.
    Does NOT raise HTTPException to avoid 500 errors in case of dependency failures.
    Routers should handle 'if user is None' logic.
    """
    if not authorization:
        return None
    
    try:
        token = authorization.replace("Bearer ", "")
        if not token or token == "null":
            return None
            
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
             return None
             
        return user_response.user
    except Exception as e:
        print(f"Auth Soft-Fail: {e}") 
        return None
