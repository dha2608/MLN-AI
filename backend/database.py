import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Global error capture
init_error = None

# Load env from root directory
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "") or os.environ.get("SUPABASE_KEY", "")

# CRITICAL FIX FOR VERCEL:
# Vercel injects HTTP_PROXY/HTTPS_PROXY environment variables that httpx (used by supabase-py)
# picks up. This causes connection failures (500 errors).
# We must forcefully unset them and set NO_PROXY.
if "HTTP_PROXY" in os.environ:
    del os.environ["HTTP_PROXY"]
if "HTTPS_PROXY" in os.environ:
    del os.environ["HTTPS_PROXY"]
os.environ["NO_PROXY"] = "*"

if not url or not key:
    print("CRITICAL WARNING: SUPABASE_URL or SUPABASE_KEY not found in environment variables.", file=sys.stderr)

try:
    # Initialize Supabase client
    # We use the Service Role Key to bypass RLS for backend operations.
    # The backend acts as a trusted environment.
    
    # Force timeout settings to prevent hanging
    from supabase.client import ClientOptions
    
    options = ClientOptions(
        postgrest_client_timeout=10,
        storage_client_timeout=10
    )
    
    # Simple initialization without ClientOptions to minimize failure surface
    supabase: Client = create_client(url.strip(), key.strip(), options=options)
        
    print("Successfully initialized Supabase client.", file=sys.stderr)

except Exception as e:
    init_error = str(e)
    print(f"FATAL: Failed to initialize Supabase client: {e}", file=sys.stderr)
    # ... rest of error handling
    import traceback
    traceback.print_exc(file=sys.stderr)
    
    # Fallback dummy client to allow app to start (but endpoints will fail)
    class DummyClient:
        def __getattr__(self, name):
            raise Exception(f"Supabase client failed to initialize: {init_error}")
            
    supabase = DummyClient()
