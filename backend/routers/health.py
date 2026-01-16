from fastapi import APIRouter
from backend.database import supabase, init_error

router = APIRouter()

@router.get("/health/db")
async def db_health_check():
    if init_error:
        return {"status": "error", "message": f"Client Init Failed: {init_error}"}
    
    try:
        # Simple query to check connectivity
        res = supabase.table("users").select("count", count="exact").limit(1).execute()
        return {
            "status": "ok", 
            "count": res.count, 
            "data_sample": len(res.data)
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}