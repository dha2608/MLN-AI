import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.database import supabase

try:
    print("Testing get_user method existence...")
    if hasattr(supabase.auth, 'get_user'):
        print("get_user method exists.")
    else:
        print("get_user method DOES NOT exist.")
        # Check for similar methods
        print("Available methods:", [m for m in dir(supabase.auth) if not m.startswith('_')])

except Exception as e:
    print(f"Error: {e}")
