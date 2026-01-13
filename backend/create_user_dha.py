import asyncio
import os
import sys

# Add backend to path to import database
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.database import supabase

def create_user_dha():
    email = "dha2608@gmail.com"
    password = "123456"
    name = "Người dùng DHA"

    print(f"Creating user {email}...")
    
    try:
        # Attempt sign up
        res = supabase.auth.sign_up({
            "email": email, 
            "password": password, 
            "options": {"data": {"name": name}}
        })
        
        if hasattr(res, 'user') and res.user:
            user = res.user
            print(f"User created with ID: {user.id}")
            
            # Insert into public.users
            try:
                existing_user = supabase.table("users").select("*").eq("id", user.id).execute()
                if not existing_user.data:
                    supabase.table("users").insert({
                        "id": user.id,
                        "email": email,
                        "name": name,
                        "password_hash": "managed_by_supabase_auth",
                        "avatar_url": None
                    }).execute()
                    print("Added to public.users table.")
                else:
                    print("User already in public.users table.")
            except Exception as e:
                print(f"Database error: {e}")
        else:
             print("Sign up returned no user. User might already exist.")
             
    except Exception as e:
        print(f"Sign up failed (likely exists): {e}")

    print("\n=== TÀI KHOẢN NGƯỜI DÙNG ===")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print("=======================")

if __name__ == "__main__":
    create_user_dha()
