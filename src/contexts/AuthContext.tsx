/**
 * ===== AUTH CONTEXT =====
 * Quản lý trạng thái xác thực toàn cục cho ứng dụng.
 *
 * Cung cấp:
 * - user / session   — Thông tin người dùng & phiên đăng nhập (Supabase Auth)
 * - loading          — Trạng thái đang tải ban đầu (chờ kiểm tra session)
 * - isPremium        — Tài khoản Premium hay Free (từ bảng profiles)
 * - isAdmin          — Có vai trò admin không (từ bảng user_roles)
 * - signOut()        — Đăng xuất
 * - refreshProfile() — Tải lại thông tin Premium/Admin (sau khi cập nhật)
 *
 * Luồng hoạt động:
 * 1. Khi mount: gọi getSession() → lấy session hiện tại → fetch metadata
 * 2. Lắng nghe onAuthStateChange: tự động cập nhật khi login/logout
 * 3. fetchUserMeta: query song song profiles + user_roles để giảm latency
 */

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// ===== Interface & Context =====
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isPremium: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isPremium: false,
  isAdmin: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// ===== Provider Component =====
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  /**
   * Lấy thông tin Premium & Admin từ database.
   * Query song song 2 bảng để tối ưu tốc độ.
   */
  const fetchUserMeta = async (userId: string) => {
    const [profileRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("is_premium, premium_expires_at").eq("user_id", userId).single(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    // Auto-expiry check: if premium_expires_at has passed, treat as non-premium
    const profile = profileRes.data;
    let premium = profile?.is_premium ?? false;
    if (premium && profile?.premium_expires_at) {
      const expiresAt = new Date(profile.premium_expires_at);
      if (expiresAt < new Date()) {
        premium = false;
        // Update DB to reflect expired status (fire-and-forget)
        supabase.from("profiles").update({ is_premium: false }).eq("user_id", userId).then();
      }
    }

    setIsPremium(premium);
    setIsAdmin(rolesRes.data?.some((r) => r.role === "admin") ?? false);
  };

  /** Reset metadata khi đăng xuất */
  const clearMeta = () => {
    setIsPremium(false);
    setIsAdmin(false);
  };

  /** Tải lại thông tin profile (gọi sau khi cập nhật Premium/Role) */
  const refreshProfile = async () => {
    if (user) await fetchUserMeta(user.id);
  };

  useEffect(() => {
    let isMounted = true;

    // Lắng nghe thay đổi auth (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // setTimeout tránh deadlock với Supabase client
          setTimeout(() => {
            if (isMounted) fetchUserMeta(session.user.id);
          }, 0);
        } else {
          clearMeta();
        }
      }
    );

    // Khởi tạo: kiểm tra session có sẵn → fetch metadata → tắt loading
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserMeta(session.user.id);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /** Đăng xuất: xóa metadata trước → gọi Supabase signOut */
  const signOut = async () => {
    clearMeta();
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isPremium, isAdmin, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
