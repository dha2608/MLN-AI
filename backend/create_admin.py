import asyncio
import os
import sys
import inspect

# Add backend to path to import database
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.database import supabase

def create_admin_user():
    email = "admin@example.com"
    password = "admin123456"
    name = "Quản Trị Viên"

    print(f"Creating user {email}...")
    
    # Inspect signature
    try:
        print("Sign up signature:", inspect.signature(supabase.auth.sign_up))
        print("Sign in signature:", inspect.signature(supabase.auth.sign_in_with_password))
    except Exception as e:
        print(f"Could not inspect signature: {e}")

    # Try based on signature or common patterns
    try:
        # If signature shows (params), pass dict. If (email, password), pass args.
        pass
    except:
        pass

    # Attempt 1: Pass dict (mimic JS or wrapper)
    print("Attempting sign_up with dict...")
    try:
        res = supabase.auth.sign_up({
            "email": email, 
            "password": password, 
            "options": {"data": {"name": name}}
        })
        # Check result
        if hasattr(res, 'user') and res.user:
            print("Success with dict!")
            user = res.user
            # ... proceed
            finalize_user(user, email, name, password)
            return
    except Exception as e:
        print(f"Dict attempt failed: {e}")

    # Attempt 2: Pass args
    print("Attempting sign_up with args...")
    try:
        res = supabase.auth.sign_up(email, password, options={"data": {"name": name}}) # Positional?
        if hasattr(res, 'user') and res.user:
             print("Success with args!")
             user = res.user
             finalize_user(user, email, name, password)
             return
    except Exception as e:
        print(f"Args attempt failed: {e}")

def finalize_user(user, email, name, password):
    print(f"User created/found with ID: {user.id}")
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

    print("\n=== TÀI KHOẢN ADMIN ===")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print("=======================")

if __name__ == "__main__":
    create_admin_user()
