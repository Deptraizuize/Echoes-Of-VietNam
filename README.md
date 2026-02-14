# 🇻🇳 Echoes of Vietnam — Web Tương Tác Lịch Sử Việt Nam

> Ứng dụng web giáo dục lịch sử Việt Nam với hệ thống quiz, gamification và AI chatbot.

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Hướng dẫn tự setup](#-hướng-dẫn-tự-setup)
  - [Bước 1: Clone source code](#bước-1-clone-source-code)
  - [Bước 2: Tạo Supabase project](#bước-2-tạo-supabase-project)
  - [Bước 3: Setup database](#bước-3-setup-database)
  - [Bước 4: Cấu hình Storage](#bước-4-cấu-hình-storage)
  - [Bước 5: Cấu hình Authentication](#bước-5-cấu-hình-authentication)
  - [Bước 6: Deploy Edge Functions](#bước-6-deploy-edge-functions)
  - [Bước 7: Cấu hình biến môi trường](#bước-7-cấu-hình-biến-môi-trường)
  - [Bước 8: Chạy ứng dụng](#bước-8-chạy-ứng-dụng)
- [Tạo tài khoản Admin](#-tạo-tài-khoản-admin)
- [Tính năng chính](#-tính-năng-chính)
- [Kiến trúc bảo mật](#-kiến-trúc-bảo-mật)

---

## 🎯 Tổng quan

**Echoes of Vietnam** là ứng dụng web tương tác giúp người dùng khám phá lịch sử Việt Nam qua:

- **Dòng thời gian 3D** — Carousel xoay theo các thời kỳ lịch sử
- **Quiz kiểm tra kiến thức** — Hệ thống chấm điểm server-side, chống gian lận
- **Gamification** — Tim (mạng sống), điểm, huy hiệu, bảng xếp hạng
- **AI Chatbot** — Trợ lý lịch sử AI (Premium only)
- **Hệ thống Premium** — Tài khoản nâng cấp với đặc quyền
- **Admin Dashboard** — Quản lý nội dung, người dùng, câu hỏi

---

## 🛠 Công nghệ sử dụng

| Layer      | Công nghệ                                      |
|------------|------------------------------------------------|
| Frontend   | React 18, TypeScript, Vite                     |
| Styling    | Tailwind CSS, shadcn/ui                        |
| Animation  | Framer Motion                                  |
| State      | TanStack Query (React Query)                   |
| Backend    | Supabase (PostgreSQL + Auth + Storage + Edge)   |
| AI         | Google Gemini (qua Lovable AI Gateway)          |
| Routing    | React Router v6                                |

---

## 📁 Cấu trúc thư mục

```
├── docs/
│   └── database-setup.sql      # Script SQL tạo toàn bộ database
├── public/                     # Assets tĩnh (favicon, robots.txt)
├── src/
│   ├── assets/                 # Hình ảnh (hero, periods, features)
│   ├── components/
│   │   ├── admin/              # Components trang quản trị
│   │   ├── ai/                 # AI chatbot (Premium)
│   │   ├── auth/               # Form đăng nhập/đăng ký
│   │   ├── home/               # Landing page sections
│   │   ├── layout/             # Header, navigation
│   │   ├── quiz/               # Quiz UI (banner, review)
│   │   ├── timeline/           # Timeline 3D carousel, cards
│   │   └── ui/                 # shadcn/ui components
│   ├── contexts/
│   │   └── AuthContext.tsx      # Context xác thực + RBAC
│   ├── data/
│   │   └── timelineData.ts     # Dữ liệu thời kỳ lịch sử
│   ├── hooks/                  # Custom hooks
│   ├── integrations/
│   │   └── supabase/           # Client + Types (auto-generated)
│   ├── lib/
│   │   └── utils.ts            # Utility functions
│   └── pages/                  # Route pages (Index, Timeline, Quiz, Admin...)
├── supabase/
│   ├── functions/
│   │   ├── delete-user/        # Edge function: xóa tài khoản
│   │   └── history-chat/       # Edge function: AI chatbot
│   └── config.toml             # Cấu hình Supabase CLI
└── .env                        # Biến môi trường (tạo thủ công)
```

---

## 🚀 Hướng dẫn tự setup

### Yêu cầu

- [Node.js](https://nodejs.org/) ≥ 18
- [Supabase CLI](https://supabase.com/docs/guides/cli) (để deploy edge functions)
- Tài khoản [Supabase](https://supabase.com/) (miễn phí)

---

### Bước 1: Clone source code

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
```

---

### Bước 2: Tạo Supabase project

1. Truy cập [app.supabase.com](https://app.supabase.com/)
2. Nhấn **New Project** → đặt tên, chọn region, tạo mật khẩu database
3. Chờ project tạo xong → vào **Settings → API** để lấy:
   - **Project URL** (ví dụ: `https://abcxyz.supabase.co`)
   - **anon public key** (bắt đầu bằng `eyJ...`)
   - **Project ID** (chuỗi ngắn trong URL, ví dụ: `abcxyz`)

---

### Bước 3: Setup database

1. Trong Supabase Dashboard → **SQL Editor**
2. Mở file `docs/database-setup.sql` từ source code
3. **Copy toàn bộ nội dung** và paste vào SQL Editor
4. Nhấn **Run** → chờ chạy xong (không có lỗi)

> ⚠️ Script này tạo: 16 bảng, RLS policies, 11 functions, triggers, storage bucket.
> Chỉ chạy **MỘT LẦN** trên database mới. Nếu chạy lại sẽ bị lỗi conflict.

---

### Bước 4: Cấu hình Storage

Script SQL đã tự tạo bucket `avatars`. Kiểm tra:

1. **Storage** → xác nhận bucket `avatars` tồn tại và là **Public**
2. Nếu chưa có, tạo thủ công:
   - Tên: `avatars`
   - Public: ✅ Bật

---

### Bước 5: Cấu hình Authentication

1. Trong Supabase Dashboard → **Authentication → Providers**
2. Đảm bảo **Email** provider đã bật (mặc định bật sẵn)
3. **(Tùy chọn)** Bật **Google OAuth**:
   - Vào [Google Cloud Console](https://console.cloud.google.com/)
   - Tạo OAuth 2.0 Client ID
   - Thêm Redirect URL: `https://<your-project-id>.supabase.co/auth/v1/callback`
   - Copy Client ID + Secret vào Supabase → Authentication → Providers → Google

---

### Bước 6: Deploy Edge Functions

Cài Supabase CLI và link project:

```bash
# Cài Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project (nhập project ID và database password)
supabase link --project-ref <YOUR_PROJECT_ID>
```

Deploy 2 edge functions:

```bash
# AI Chatbot (lịch sử)
supabase functions deploy history-chat --no-verify-jwt

# Xóa tài khoản
supabase functions deploy delete-user
```

#### Cấu hình Secrets cho Edge Functions

```bash
# LOVABLE_API_KEY — cần cho AI chatbot (history-chat)
# Nếu bạn dùng Lovable AI Gateway, lấy key từ Lovable.
# Nếu không, bạn cần sửa code history-chat để dùng API khác (ví dụ: Google AI Studio).
supabase secrets set LOVABLE_API_KEY=<your_api_key>
```

> 💡 **Lưu ý:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` đã tự động có sẵn trong edge functions, không cần set thêm.

---

### Bước 7: Cấu hình biến môi trường

Tạo file `.env` ở thư mục gốc:

```env
VITE_SUPABASE_PROJECT_ID="<YOUR_PROJECT_ID>"
VITE_SUPABASE_PUBLISHABLE_KEY="<YOUR_ANON_KEY>"
VITE_SUPABASE_URL="https://<YOUR_PROJECT_ID>.supabase.co"
```

> ⚠️ Thay `<YOUR_PROJECT_ID>` và `<YOUR_ANON_KEY>` bằng giá trị thật từ Bước 2.

---

### Bước 8: Chạy ứng dụng

```bash
npm run dev
```

Truy cập `http://localhost:5173` để xem kết quả.

---

## 👑 Tạo tài khoản Admin

Sau khi đăng ký tài khoản đầu tiên, gán quyền admin bằng SQL:

```sql
-- Thay '<USER_ID>' bằng user_id thật (lấy từ bảng profiles hoặc auth.users)
INSERT INTO public.user_roles (user_id, role)
VALUES ('<USER_ID>', 'admin');
```

Chạy lệnh này trong **SQL Editor** của Supabase Dashboard.

Sau đó đăng nhập lại → truy cập `/admin` để vào trang quản trị.

---

## ✨ Tính năng chính

| Tính năng | Mô tả | Quyền |
|-----------|--------|-------|
| Dòng thời gian | Carousel 3D các cột mốc lịch sử | Công khai |
| Chi tiết cột mốc | Bài viết Markdown với hình ảnh | Đăng nhập |
| Quiz | 10 câu hỏi trắc nghiệm/cột mốc, chấm server-side | Đăng nhập |
| Tim (Hearts) | 5/ngày (Free), 10/ngày (Premium), mất 1 khi score < 8 | Đăng nhập |
| Điểm & Badge | Tích điểm, nhận huy hiệu khi hoàn thành quiz | Đăng nhập |
| x2 Điểm | Premium: nhân đôi điểm 2 lần/ngày | Premium |
| AI Chatbot | Hỏi đáp lịch sử với Google Gemini | Premium |
| Bảng xếp hạng | Top 50 điểm cao nhất | Đăng nhập |
| Đổi thưởng | Dùng điểm đổi phần thưởng | Đăng nhập |
| Admin Dashboard | Quản lý user, quiz, nội dung, banner, feedback | Admin |
| Xóa tài khoản | User tự xóa hoặc Admin xóa (trừ admin) | Đăng nhập/Admin |

---

## 🔒 Kiến trúc bảo mật

```
┌─────────────────────────────────────────────────────────┐
│ CHỐNG GIAN LẬN (Anti-Cheat)                             │
├─────────────────────────────────────────────────────────┤
│ • correct_answer ẩn khỏi client (qua RPC)               │
│ • Chấm điểm hoàn toàn server-side (submit_quiz)         │
│ • Client KHÔNG THỂ ghi: quiz_attempts, progress, badges │
│ • Client KHÔNG THỂ sửa: hearts, daily_limits            │
│ • Trigger protect_profile_fields chặn sửa points/premium│
├─────────────────────────────────────────────────────────┤
│ PHÂN QUYỀN                                              │
├─────────────────────────────────────────────────────────┤
│ • Roles tách bảng riêng (user_roles) — chống escalation  │
│ • has_role() SECURITY DEFINER — tránh RLS đệ quy         │
│ • Kiểm tra quyền cả client-side (UX) + server-side (RLS)│
├─────────────────────────────────────────────────────────┤
│ QUYỀN RIÊNG TƯ                                          │
├─────────────────────────────────────────────────────────┤
│ • User chỉ xem dữ liệu của mình (RLS)                   │
│ • Leaderboard qua RPC — không lộ user_id                 │
│ • Avatar trong folder riêng: {user_id}/*                 │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Ghi chú bổ sung

- **AI Chatbot**: Mặc định dùng Lovable AI Gateway (`ai.gateway.lovable.dev`). Nếu tự host, bạn cần sửa `supabase/functions/history-chat/index.ts` để trỏ sang API khác (ví dụ: Google AI Studio, OpenAI).
- **Google OAuth**: Tùy chọn. App hoạt động đầy đủ chỉ với đăng nhập Email/Password + Username.
- **Database script**: Xem chi tiết giải thích từng bảng, RLS, function tại `docs/database-setup.sql`.

---

## 📄 License

Dự án này được phát triển trên nền tảng [Lovable](https://lovable.dev/).
