from fastapi import APIRouter, HTTPException, status
from backend.models import UserRegister, UserLogin, Token
from backend.database import supabase
from gotrue.errors import AuthApiError
from backend.logger import log_error, log_info

router = APIRouter()

@router.post("/register")
async def register(user_data: UserRegister):
    try:
        log_info(f"Registering user: {user_data.email}")
        # 1. Register with Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {"name": user_data.name}
            }
        })
        
        # Check if user was created
        user = getattr(auth_response, 'user', None)
        if not user:
             raise HTTPException(status_code=400, detail="Registration failed or user already exists")

        # 2. Create user record in public.users table
        # Note: If Supabase Trigger is set up, this might be redundant or fail.
        # But for this MVP without triggers, we insert manually.
        try:
            supabase.table("users").insert({
                "id": user.id,
                "email": user_data.email,
                "name": user_data.name,
                "password_hash": "managed_by_supabase_auth" 
            }).execute()
        except Exception as db_error:
            # Ignore if already exists (trigger might have done it)
            log_info(f"DB Insert info: {db_error}")

        # 3. Return token
        # Handle custom response object from wrapper
        session = getattr(auth_response, 'session', None)
        user = getattr(auth_response, 'user', None)

        if session:
            return {
                "user_id": user.id,
                "access_token": session.access_token,
                "refresh_token": session.refresh_token,
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
                # Handle custom response object from wrapper
                session = getattr(login_response, 'session', None)
                user = getattr(login_response, 'user', None)
                
                if session:
                     return {
                        "user_id": user.id,
                        "access_token": session.access_token,
                        "refresh_token": session.refresh_token,
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
        log_error(f"Registration Error: {e}")
        error_msg = str(e)
        if "User already registered" in error_msg:
             raise HTTPException(status_code=400, detail="Email này đã được đăng ký.")
        raise HTTPException(status_code=400, detail=error_msg)

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    try:
        log_info(f"Login attempt: {user_data.email}")
        
        # Check if we are using the custom client wrapper (requests-based)
        if hasattr(supabase, 'auth') and hasattr(supabase.auth, 'sign_in_with_password'):
             response = supabase.auth.sign_in_with_password({
                "email": user_data.email,
                "password": user_data.password
            })
        else:
             # Fallback if standard client
             response = supabase.auth.sign_in_with_password({
                "email": user_data.email,
                "password": user_data.password
            })
        
        # Handle custom response object from wrapper
        session = getattr(response, 'session', None)
        user = getattr(response, 'user', None)
        
        if not session:
             raise HTTPException(status_code=400, detail="Login failed")
             
        return {
            "user_id": user.id,
            "access_token": session.access_token,
            "refresh_token": session.refresh_token,
            "token_type": "bearer"
        }
    except AuthApiError as e:
        log_error(f"Auth Error: {e}")
        raise HTTPException(status_code=400, detail="Email hoặc mật khẩu không chính xác")
    except Exception as e:
        log_error(f"Login Error: {e}", e)
        # Check if it's the specific 400 error from our custom client
        if "Invalid login credentials" in str(e):
             raise HTTPException(status_code=400, detail="Email hoặc mật khẩu không chính xác")
        # In production, avoid leaking internal errors
        raise HTTPException(status_code=500, detail="Internal Login Error")
