from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from backend.models import ChatMessage, ChatResponse
from backend.dependencies import get_current_user
from backend.database import supabase
from datetime import datetime
import os
import openai
from backend.logger import log_info, log_error

router = APIRouter()

@router.post("/send", response_model=ChatResponse)
async def send_message(chat_msg: ChatMessage, user=Depends(get_current_user)):
    try:
        user_id = user.id
        conversation_id = chat_msg.conversation_id
        
        log_info(f"Chat request from user: {user_id}")

        # 0. Ensure user exists in public.users
        try:
            # Check if user exists first using a simple query
            check_user = supabase.table("users").select("id").eq("id", user_id).execute()
            
            if not check_user.data:
                log_info(f"User {user_id} not found in DB. Attempting to insert.")
                user_metadata = user.user_metadata or {}
                email_val = user.email or f"no-email-{user_id}@example.com"
                name_val = user_metadata.get('full_name') or user_metadata.get('name') or email_val.split('@')[0]
                
                user_data = {
                    "id": user_id,
                    "email": email_val,
                    "name": name_val,
                    "avatar_url": user_metadata.get('avatar_url'),
                    "password_hash": "google_oauth" # Dummy value to satisfy NOT NULL constraint
                }
                supabase.table("users").insert(user_data).execute()
                log_info(f"User {user_id} inserted successfully.")
            else:
                # Optional: Update metadata
                user_metadata = user.user_metadata or {}
                if user_metadata.get('avatar_url'):
                    supabase.table("users").update({
                        "avatar_url": user_metadata.get('avatar_url')
                    }).eq("id", user_id).execute()

        except Exception as e:
            log_error(f"User Sync Error for {user_id}", e)
            pass

        # 1. Create conversation if not exists
        if not conversation_id:
            log_info("Creating new conversation")
            conv_data = supabase.table("conversations").insert({
                "user_id": user_id,
                "title": chat_msg.message[:50] + "..."
            }).execute()
            conversation_id = conv_data.data[0]['id']

        # 2. Save user message
        log_info(f"Saving user message for conversation {conversation_id}")
        supabase.table("messages").insert({
            "conversation_id": conversation_id,
            "content": chat_msg.message,
            "role": "user"
        }).execute()

        # 3. Call OpenAI
        openai_api_key = os.getenv("OPENAI_API_KEY")
        ai_response_text = ""
        
        if openai_api_key:
            try:
                log_info("Calling OpenAI API")
                client = openai.OpenAI(api_key=openai_api_key)
                
                system_content = """
Bạn là một AI chuyên gia về Triết học Mác - Lênin (Marxist-Leninist Philosophy).
Nhiệm vụ của bạn là giải đáp các câu hỏi, thắc mắc, và hỗ trợ các hoạt động sáng tạo (như làm thơ, viết văn, phản biện) dựa trên quan điểm, nguyên lý và phương pháp luận của chủ nghĩa Mác - Lênin.

QUY TẮC:
1. NẾU người dùng yêu cầu sáng tác (thơ, văn, câu chuyện...) LIÊN QUAN đến triết học, lịch sử, chính trị, hoặc các chủ đề Mác - Lênin, HÃY THỰC HIỆN một cách sáng tạo và đầy cảm hứng.
2. NẾU người dùng hỏi về kiến thức, hãy trả lời Chính xác, Khách quan, Khoa học.
3. NẾU người dùng hỏi về các vấn đề HOÀN TOÀN KHÔNG LIÊN QUAN (ví dụ: giải toán thuần túy, tình yêu đôi lứa không gắn với xã hội, dự báo thời tiết...), hãy lịch sự từ chối và hướng người dùng quay lại chủ đề triết học.
4. Giữ thái độ nghiêm túc, tôn trọng và chuẩn mực.
"""
                if chat_msg.system_instruction:
                    system_content = f"Bạn là một chuyên gia triết học Mác - Lênin. {chat_msg.system_instruction}"

                messages = [
                    {"role": "system", "content": system_content},
                    {"role": "user", "content": chat_msg.message}
                ]
                
                completion = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages
                )
                ai_response_text = completion.choices[0].message.content
                log_info("OpenAI response received")
            except Exception as openai_error:
                log_error("OpenAI API Error", openai_error)
                ai_response_text = "Xin lỗi, hiện tại tôi không thể kết nối với trí tuệ nhân tạo. Vui lòng thử lại sau."
        else:
            log_error("OpenAI API Key missing")
            ai_response_text = "Chưa cấu hình OpenAI API Key."

        # 4. Save AI response
        log_info("Saving AI response")
        supabase.table("messages").insert({
            "conversation_id": conversation_id,
            "content": ai_response_text,
            "role": "assistant"
        }).execute()

        # 5. Update statistics
        try:
            log_info("Updating statistics")
            stats = supabase.table("statistics").select("*").eq("user_id", user_id).execute()
            if not stats.data:
                supabase.table("statistics").insert({
                    "user_id": user_id, 
                    "total_questions": 1,
                    "quiz_score": 0,
                    "last_quiz_date": None
                }).execute()
            else:
                current_total = stats.data[0].get('total_questions', 0)
                supabase.table("statistics").update({"total_questions": current_total + 1}).eq("user_id", user_id).execute()
        except Exception as e:
            log_error("Stats Update Error", e)

        return {
            "response": ai_response_text,
            "conversation_id": conversation_id,
            "timestamp": datetime.now()
        }

    except Exception as e:
        log_error("Chat Critical Error", e)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/history/recent")
async def get_recent_history(user=Depends(get_current_user)):
    try:
        response = supabase.table("conversations").select("*").eq("user_id", user.id).order("created_at", desc=True).limit(10).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: str, user=Depends(get_current_user)):
    try:
        # Check ownership
        conv = supabase.table("conversations").select("user_id").eq("id", conversation_id).execute()
        if not conv.data or conv.data[0]['user_id'] != user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
            
        supabase.table("conversations").delete().eq("id", conversation_id).execute()
        return {"message": "Conversation deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class RenameChat(BaseModel):
    title: str

@router.put("/{conversation_id}")
async def rename_conversation(conversation_id: str, data: RenameChat, user=Depends(get_current_user)):
    try:
        # Check ownership
        conv = supabase.table("conversations").select("user_id").eq("id", conversation_id).execute()
        if not conv.data or conv.data[0]['user_id'] != user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
            
        supabase.table("conversations").update({"title": data.title}).eq("id", conversation_id).execute()
        return {"message": "Conversation renamed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{conversation_id}")
async def get_conversation(conversation_id: str, user=Depends(get_current_user)):
    try:
        messages = supabase.table("messages").select("*").eq("conversation_id", conversation_id).order("created_at").execute()
        return messages.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
