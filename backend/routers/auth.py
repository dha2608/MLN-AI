from fastapi import APIRouter, HTTPException, status
from backend.models import UserRegister, UserLogin, Token
from backend.database import supabase

router = APIRouter()

@router.post("/register")
async def register(user_data: UserRegister):
    try:
        # 1. Register with Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {"name": user_data.name}
            }
        })
        
        # Check if user was created
        if not auth_response.user:
             raise HTTPException(status_code=400, detail="Registration failed or user already exists")

        # 2. Create user record in public.users table
        # Note: If Supabase Trigger is set up, this might be redundant or fail.
        # But for this MVP without triggers, we insert manually.
        try:
            supabase.table("users").insert({
                "id": auth_response.user.id,
                "email": user_data.email,
                "name": user_data.name,
                "password_hash": "managed_by_supabase_auth" 
            }).execute()
        except Exception as db_error:
            # Ignore if already exists (trigger might have done it)
            print(f"DB Insert info: {db_error}")

        # 3. Return token
        if auth_response.session:
            return {
                "user_id": auth_response.user.id,
                "access_token": auth_response.session.access_token,
                "refresh_token": auth_response.session.refresh_token,
                "token_type": "bearer"
            }
        else:
            # Check if auto-confirm is enabled by trying to login immediately
            # If the session is missing, it MIGHT be because email confirmation is required.
            # OR it might be because Supabase returned a user but no session for some other reason.
            
            # Try to sign in. If this works, we return the token.
            try:
                login_response = supabase.auth.sign_in_with_password({
                    "email": user_data.email,
                    "password": user_data.password
                })
                if login_response.session:
                     return {
                        "user_id": login_response.user.id,
                        "access_token": login_response.session.access_token,
                        "refresh_token": login_response.session.refresh_token,
                        "token_type": "bearer"
                    }
            except:
                pass
            
            # If login failed, assume email confirmation is needed or session creation failed silently
            # In standard Supabase setup, sign_up with auto-confirm OFF returns user but no session.
            # We return a 200 OK with a message, but the frontend needs to handle this non-token response.
            
            # IMPORTANT: Frontend expects either a token OR a message.
            # However, standard flow is usually to auto-login.
            # If we return a dict with "message", the frontend (if using Token model) might fail validation 
            # if the response_model is strict. 
            
            # Let's change the response logic to be more flexible or return a specific status.
            # But wait, this endpoint doesn't enforce response_model=Token in the decorator.
            # So returning a dict is fine.
            
            return {
                "message": "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
            }

    except Exception as e:
        error_msg = str(e)
        if "User already registered" in error_msg:
             raise HTTPException(status_code=400, detail="Email này đã được đăng ký.")
        raise HTTPException(status_code=400, detail=error_msg)

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": user_data.email,
            "password": user_data.password
        })
        
        if not response.session:
             raise HTTPException(status_code=400, detail="Login failed")
             
        return {
            "user_id": response.user.id,
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "token_type": "bearer"
        }
    except AuthApiError as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=400, detail="Email hoặc mật khẩu không chính xác")
    except Exception as e:
        print(f"Login Error: {e}")
        # In production, avoid leaking internal errors, but for now we log it
        raise HTTPException(status_code=500, detail=f"Internal Login Error: {str(e)}")
