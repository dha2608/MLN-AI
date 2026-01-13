# AIchatMLN - Chatbot Triết học Marx-Lenin

Dự án Chatbot AI trả lời câu hỏi về triết học Marx-Lenin, sử dụng React (Frontend), FastAPI (Backend), Supabase (Database) và OpenAI.

## Yêu cầu hệ thống
- **Node.js**: v16 trở lên.
- **Python**: v3.8 trở lên.
- **VS Code**: IDE khuyến nghị.
- **Tài khoản Supabase**: Để tạo database và authentication.
- **Tài khoản OpenAI**: Để sử dụng API (tùy chọn, có thể dùng mock data).

## Hướng dẫn cài đặt và chạy trên VS Code

### Bước 1: Chuẩn bị môi trường

1.  Mở thư mục dự án bằng **VS Code**.
2.  Mở Terminal trong VS Code (`Ctrl + ` `).
3.  Tạo file `.env` tại **thư mục gốc** của dự án và điền thông tin sau:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-proj-...
```
*Lưu ý: Các key này lấy từ Dashboard của Supabase (Project Settings > API) và OpenAI Platform.*

### Bước 2: Cài đặt và chạy Backend (FastAPI)

Tại Terminal của VS Code:

1.  **Tạo môi trường ảo Python**:
    ```powershell
    python -m venv venv
    ```

2.  **Cài đặt thư viện**:
    ```powershell
    venv\Scripts\pip install -r backend/requirements.txt
    ```

3.  **Khởi tạo Database (nếu chưa có)**:
    Chạy script migration SQL trong thư mục `supabase/migrations` trên giao diện SQL Editor của Supabase.

4.  **Tạo tài khoản Admin (Tùy chọn)**:
    ```powershell
    venv\Scripts\python backend/create_admin.py
    ```
    *Tài khoản mặc định: admin@example.com / admin123456*

5.  **Chạy Server**:
    ```powershell
    venv\Scripts\uvicorn backend.main:app --reload
    ```
    *Server sẽ chạy tại: http://localhost:8000*

### Bước 3: Cài đặt và chạy Frontend (React)

Mở một tab Terminal mới trong VS Code (`Ctrl + Shift + ` `) (để giữ Backend đang chạy ở tab kia):

1.  **Cài đặt thư viện Node**:
    ```powershell
    npm install
    ```

2.  **Chạy ứng dụng**:
    ```powershell
    npm run dev
    ```
    *Ứng dụng sẽ chạy tại: http://localhost:5173 (hoặc 5176 nếu cổng bận)*

## Sử dụng

1.  Truy cập link Frontend (ví dụ `http://localhost:5173`).
2.  Đăng nhập bằng tài khoản Admin đã tạo hoặc đăng ký tài khoản mới.
3.  Vào trang Chat để bắt đầu hỏi đáp.

## Cấu trúc dự án
- `backend/`: Mã nguồn server Python/FastAPI.
- `src/`: Mã nguồn giao diện React.
- `supabase/`: Các file cấu hình và migration cho database.

## Các lỗi thường gặp
- **Lỗi `uvicorn` not found**: Hãy chắc chắn bạn dùng `venv\Scripts\uvicorn` thay vì chỉ `uvicorn` nếu chưa activate môi trường.
- **Lỗi CORS**: Đảm bảo Backend đã cấu hình `origins` trong `backend/main.py` đúng với port của Frontend đang chạy.
