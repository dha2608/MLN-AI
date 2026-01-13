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
            # Try login immediately (works if Confirm Email is OFF)
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
                
            # If still no session, it means Confirm Email is ON
            return {
                "message": "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập."
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
    except Exception as e:
        print(f"Login Error: {e}")
        raise HTTPException(status_code=400, detail="Invalid email or password")
