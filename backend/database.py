import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions

# Load env from root directory
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "") or os.environ.get("SUPABASE_KEY", "")

if not url or not key:
    print("CRITICAL WARNING: SUPABASE_URL or SUPABASE_KEY not found in environment variables.", file=sys.stderr)

try:
    # Initialize Supabase client
    # We use the Service Role Key to bypass RLS for backend operations.
    # The backend acts as a trusted environment.
    
    # CRITICAL FIX FOR VERCEL:
    # Vercel injects HTTP_PROXY/HTTPS_PROXY environment variables that httpx (used by supabase-py)
    # picks up. This causes connection failures (500 errors) because the internal proxy
    # rejects external connections to Supabase.
    # Setting NO_PROXY to "*" forces httpx to bypass the proxy and connect directly.
    os.environ["NO_PROXY"] = "*"
    
    # Explicitly set postgrest_client_timeout to avoid timeouts on serverless
    try:
        options = ClientOptions(
            postgrest_client_timeout=10,
            storage_client_timeout=10
        )
    except ImportError:
        # Fallback if ClientOptions import path changes in future versions
        print("Warning: Could not import ClientOptions. Using default options.", file=sys.stderr)
        options = None

    if options:
        supabase: Client = create_client(url.strip(), key.strip(), options=options)
    else:
        supabase: Client = create_client(url.strip(), key.strip())
        
    print("Successfully initialized Supabase client.", file=sys.stderr)

except Exception as e:
    print(f"FATAL: Failed to initialize Supabase client: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc(file=sys.stderr)
    
    # Fallback dummy client to allow app to start (but endpoints will fail)
    class DummyClient:
        def __getattr__(self, name):
            raise Exception("Supabase client failed to initialize. Check server logs.")
            
    supabase = DummyClient()
