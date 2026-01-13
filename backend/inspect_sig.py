import os
import sys
import inspect

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.database import supabase

print("Start inspection")
try:
    sig = inspect.signature(supabase.auth.sign_up)
    print(f"Sign up signature: {sig}")
except Exception as e:
    print(f"Sign up error: {e}")

try:
    sig = inspect.signature(supabase.auth.sign_in_with_password)
    print(f"Sign in signature: {sig}")
except Exception as e:
    print(f"Sign in error: {e}")
print("End inspection")
