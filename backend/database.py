import os
from dotenv import load_dotenv
from postgrest import SyncPostgrestClient
from supabase_auth import SyncGoTrueClient

# Load env from root directory
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

if not url or not key:
    print("Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in environment variables.")

class CustomSupabaseClient:
    def __init__(self, url: str, key: str):
        self.url = url
        self.key = key
        headers = {"apikey": key, "Authorization": f"Bearer {key}"}
        
        # Initialize Auth
        self.auth = SyncGoTrueClient(
            url=f"{url}/auth/v1",
            headers=headers
        )
        
        # Initialize Postgrest
        self.postgrest = SyncPostgrestClient(
            base_url=f"{url}/rest/v1",
            headers=headers
        )

        # Initialize Storage
        self.storage = CustomStorageClient(f"{url}/storage/v1", headers)

    def table(self, name: str):
        return self.postgrest.from_(name)

    def from_(self, name: str):
        return self.table(name)

import httpx

class CustomStorageClient:
    def __init__(self, base_url, headers):
        self.base_url = base_url
        self.headers = headers

    def from_(self, bucket_id: str):
        return CustomStorageFileApi(self.base_url, self.headers, bucket_id)

class CustomStorageFileApi:
    def __init__(self, base_url, headers, bucket_id):
        self.base_url = base_url
        self.headers = headers
        self.bucket_id = bucket_id

    def upload(self, path, file, options=None):
        # /object/{bucket}/{path}
        url = f"{self.base_url}/object/{self.bucket_id}/{path}"
        
        # Prepare content-type
        content_type = "application/octet-stream"
        if options and "content-type" in options:
            content_type = options["content-type"]
            
        # Supabase Storage expects the file body directly
        # headers need 'Content-Type' and 'x-upsert'
        upload_headers = self.headers.copy()
        upload_headers["Content-Type"] = content_type
        if options and options.get("upsert") == "true":
            upload_headers["x-upsert"] = "true"

        response = httpx.post(url, headers=upload_headers, content=file)
        if response.status_code not in [200, 201]:
             raise Exception(f"Storage Upload Failed: {response.text}")
        
        return response.json()

    def get_public_url(self, path):
        # /object/public/{bucket}/{path}
        return f"{self.base_url}/object/public/{self.bucket_id}/{path}"

supabase = CustomSupabaseClient(url, key)
