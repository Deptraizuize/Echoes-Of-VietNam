/**
 * ===== APP ROOT =====
 * Component gốc của ứng dụng "Echoes of Vietnam".
 *
 * Cấu trúc Provider (ngoài → trong):
 * 1. QueryClientProvider — Quản lý cache & fetch data (TanStack Query)
 * 2. AuthProvider         — Quản lý trạng thái xác thực người dùng (Supabase Auth)
 * 3. TooltipProvider      — Cung cấp tooltip cho toàn bộ UI
 *
 * Routing (React Router v6):
 * - /               → Trang chủ (giới thiệu dự án)
 * - /auth            → Đăng nhập / Đăng ký
 * - /timeline        → Dòng thời gian lịch sử Việt Nam
 * - /milestone/:id   → Chi tiết một cột mốc lịch sử
 * - /quiz/:id        → Quiz kiểm tra kiến thức theo cột mốc
 * - /profile         → Hồ sơ cá nhân (tiến trình, huy hiệu)
 * - /settings        → Cài đặt tài khoản (đổi tên, mật khẩu, avatar)
 * - /admin           → Bảng điều khiển quản trị (chỉ admin)
 * - /upgrade         → Nâng cấp tài khoản Premium
 * - /feedback        → Gửi góp ý cho admin
 * - /rewards         → Đổi điểm lấy phần thưởng
 * - *                → Trang 404
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// ===== PAGES =====
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Timeline from "./pages/Timeline";
import MilestoneDetail from "./pages/MilestoneDetail";
import Quiz from "./pages/Quiz";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Upgrade from "./pages/Upgrade";
import Feedback from "./pages/Feedback";
import Rewards from "./pages/Rewards";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        {/* Hệ thống thông báo (toast) */}
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            {/* === Trang công khai === */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/timeline" element={<Timeline />} />

            {/* === Trang yêu cầu đăng nhập === */}
            <Route path="/milestone/:milestoneId" element={<MilestoneDetail />} />
            <Route path="/quiz/:milestoneId" element={<Quiz />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/rewards" element={<Rewards />} />

            {/* === Trang Admin (kiểm tra quyền phía client + server) === */}
            <Route path="/admin" element={<Admin />} />

            {/* === Trang 404 — phải đặt cuối cùng === */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
