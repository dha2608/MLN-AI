import os
from dotenv import load_dotenv
from supabase import create_client, Client
from gotrue.errors import AuthApiError

# Load env from root directory
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "") or os.environ.get("SUPABASE_KEY", "")

if not url or not key:
    print("Warning: SUPABASE_URL or SUPABASE_KEY not found in environment variables.")

# Use the standard client which handles Auth, Postgrest, and Storage correctly
try:
    supabase: Client = create_client(url, key)
except Exception as e:
    print(f"Failed to initialize Supabase client: {e}")
    # Create a dummy client to prevent import time crash, but operations will fail
    class DummyClient:
        def __getattr__(self, name):
            raise Exception("Supabase client failed to initialize. Check logs.")
    supabase = DummyClient()
