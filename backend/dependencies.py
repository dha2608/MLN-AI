from fastapi import Header, HTTPException, status
from backend.database import supabase

async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        # Instead of raising 401 immediately, we can return None for optional auth endpoints
        # But this function is used as a dependency, so it expects a return value.
        # Let's keep it strict for now, but handle the 500 error better.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
        )
    
    try:
        token = authorization.replace("Bearer ", "")
        # Supabase-py's get_user can raise exceptions if the token is invalid format or network error
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        return user_response.user
    except HTTPException as he:
        raise he
    except Exception as e:
        # Catch ALL other errors (network, supabase client internal, etc) and map to 401
        # This prevents 500 errors from propagating to the client
        print(f"Auth Dependency Error: {e}") 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Auth failed: {str(e)}",
        )
