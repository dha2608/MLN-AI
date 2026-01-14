
import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    print("Attempting to import backend.database...")
    from backend.database import supabase
    print("Successfully imported backend.database")
    
    # Try a simple operation
    print("Attempting to fetch users...")
    response = supabase.table("users").select("count", count="exact").execute()
    print(f"Success! Response: {response}")
    
except Exception as e:
    print(f"FAILURE: {e}")
    import traceback
    traceback.print_exc()
