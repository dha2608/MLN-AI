from fastapi import APIRouter, Depends, HTTPException
from backend.models import ChatMessage, ChatResponse
from backend.dependencies import get_current_user
from backend.database import supabase
from datetime import datetime
import os
import openai

router = APIRouter()

@router.post("/send", response_model=ChatResponse)
async def send_message(chat_msg: ChatMessage, user=Depends(get_current_user)):
    try:
        user_id = user.id
        conversation_id = chat_msg.conversation_id

        # 1. Create conversation if not exists
        if not conversation_id:
            conv_data = supabase.table("conversations").insert({
                "user_id": user_id,
                "title": chat_msg.message[:50] + "..."
            }).execute()
            conversation_id = conv_data.data[0]['id']

        # 2. Save user message
        supabase.table("messages").insert({
            "conversation_id": conversation_id,
            "content": chat_msg.message,
            "role": "user"
        }).execute()

        # 3. Call OpenAI
        openai_api_key = os.getenv("OPENAI_API_KEY")
        ai_response_text = ""
        
        if openai_api_key:
            client = openai.OpenAI(api_key=openai_api_key)
            
            system_content = """
Bạn là một AI chuyên gia về Triết học Mác - Lênin (Marxist-Leninist Philosophy).
Nhiệm vụ của bạn là giải đáp các câu hỏi, thắc mắc dựa trên quan điểm, nguyên lý và phương pháp luận của chủ nghĩa Mác - Lênin.

QUY TẮC TUYỆT ĐỐI:
1. CHỈ trả lời các câu hỏi liên quan đến triết học, chính trị, kinh tế chính trị, chủ nghĩa xã hội khoa học, lịch sử đảng, tư tưởng Hồ Chí Minh và các chủ đề liên quan mật thiết đến chủ nghĩa Mác - Lênin.
2. Nếu người dùng hỏi về các vấn đề KHÔNG liên quan (ví dụ: code, giải trí, tình cảm, thời tiết, toán học thuần túy...), hãy lịch sự từ chối và hướng người dùng quay lại chủ đề triết học. Ví dụ: "Xin lỗi, tôi chỉ là trợ lý chuyên về triết học Mác - Lênin. Tôi không thể hỗ trợ bạn về vấn đề này."
3. Câu trả lời phải Chính xác, Khách quan, Khoa học và Dễ hiểu. Tránh dùng từ ngữ quá hàn lâm nếu không cần thiết.
4. Giữ thái độ nghiêm túc, tôn trọng và chuẩn mực.
"""
            # Override system prompt if provided
            if chat_msg.system_instruction:
                system_content = chat_msg.system_instruction

            # Prepare context (optional: fetch previous messages for better context)
            messages = [
                {"role": "system", "content": system_content},
                {"role": "user", "content": chat_msg.message}
            ]
            
            completion = client.chat.completions.create(
                model="gpt-4o-mini", # Or gpt-3.5-turbo, gpt-4
                messages=messages
            )
            ai_response_text = completion.choices[0].message.content
        else:
            ai_response_text = "Chưa cấu hình OpenAI API Key. Vui lòng kiểm tra biến môi trường."

        # 4. Save AI response
        supabase.table("messages").insert({
            "conversation_id": conversation_id,
            "content": ai_response_text,
            "role": "assistant"
        }).execute()

        # 5. Update statistics
        stats = supabase.table("statistics").select("*").eq("user_id", user_id).execute()
        if not stats.data:
            supabase.table("statistics").insert({"user_id": user_id, "total_questions": 1}).execute()
        else:
            current_total = stats.data[0]['total_questions']
            supabase.table("statistics").update({"total_questions": current_total + 1}).eq("user_id", user_id).execute()

        return {
            "response": ai_response_text,
            "conversation_id": conversation_id,
            "timestamp": datetime.now()
        }

    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/recent")
async def get_recent_history(user=Depends(get_current_user)):
    try:
        response = supabase.table("conversations").select("*").eq("user_id", user.id).order("created_at", desc=True).limit(10).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{conversation_id}")
async def get_conversation(conversation_id: str, user=Depends(get_current_user)):
    try:
        messages = supabase.table("messages").select("*").eq("conversation_id", conversation_id).order("created_at").execute()
        return messages.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
