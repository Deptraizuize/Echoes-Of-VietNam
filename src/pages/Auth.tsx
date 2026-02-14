import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Divider } from "@/components/auth/Divider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";
import vietnamMap from "@/assets/vietnam-map.jpg";
import { motion } from "framer-motion";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/timeline");
  }, [user, navigate]);

  const handleSubmit = async (data: { email: string; password: string; name?: string; username?: string }) => {
    setIsLoading(true);
    try {
      if (mode === "register") {
        // Validate username
        const username = data.username?.trim().toLowerCase();
        if (!username || username.length < 3 || username.length > 30) {
          toast({ title: "Tên đăng nhập không hợp lệ", description: "Cần từ 3–30 ký tự.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        if (!/^[a-z0-9._]+$/.test(username)) {
          toast({ title: "Tên đăng nhập không hợp lệ", description: "Chỉ chứa chữ thường, số, dấu chấm và gạch dưới.", variant: "destructive" });
          setIsLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: data.name || "", username },
          },
        });
        if (error) throw error;
        toast({ title: "Đăng ký thành công!", description: "Vui lòng kiểm tra email để xác nhận tài khoản." });
      } else {
        // Login: check if input is username (no @) or email
        let email = data.email.trim();

        if (!email.includes("@")) {
          // Look up email by username
          const { data: result, error: lookupError } = await supabase.rpc("get_email_by_username", { p_username: email });
          if (lookupError || !result) {
            toast({ title: "Không tìm thấy tài khoản", description: "Tên đăng nhập không tồn tại.", variant: "destructive" });
            setIsLoading(false);
            return;
          }
          email = result;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: data.password,
        });
        if (error) throw error;
        toast({ title: "Đăng nhập thành công!", description: "Chào mừng bạn trở lại Echoes of Vietnam!" });
        navigate("/timeline");
      }
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message || "Đã có lỗi xảy ra.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: "Lỗi đăng nhập Google", description: error.message || "Không thể kết nối với Google.", variant: "destructive" });
      setIsLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center">
      {/* Background Vietnam map */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={vietnamMap}
          alt=""
          className="absolute right-0 top-1/2 -translate-y-1/2 h-[120%] w-auto object-cover opacity-[0.06]"
        />
      </div>

      {/* Back button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-20 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-6"
      >
        <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-card">
          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="Logo" className="w-16 h-16 rounded-xl object-contain mb-4" />
            <h1 className="text-xl font-bold text-foreground">
              Echoes of <span className="italic text-accent">Vietnam</span>
            </h1>
            <div className="w-8 h-0.5 bg-accent rounded-full mt-3 mb-4" />
            <h2 className="text-2xl font-bold text-foreground">
              {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              {isLogin ? "Chào mừng trở lại! Đăng nhập để tiếp tục." : "Tạo tài khoản để khám phá lịch sử Việt Nam."}
            </p>
          </div>

          <GoogleButton onClick={handleGoogleLogin} isLoading={isLoading} />
          <Divider />
          <AuthForm mode={mode} onSubmit={handleSubmit} isLoading={isLoading} />

          <div className="mt-6 text-center">
            <button onClick={() => setMode(isLogin ? "register" : "login")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {isLogin ? (
                <>Chưa có tài khoản? <span className="text-accent font-medium hover:underline underline-offset-4">Đăng ký ngay</span></>
              ) : (
                <>Đã có tài khoản? <span className="text-accent font-medium hover:underline underline-offset-4">Đăng nhập</span></>
              )}
            </button>
          </div>

          {!isLogin && (
            <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
              Bằng việc đăng ký, bạn đồng ý với{" "}
              <a href="#" className="text-foreground hover:text-accent transition-colors">Điều khoản</a> và{" "}
              <a href="#" className="text-foreground hover:text-accent transition-colors">Chính sách bảo mật</a>
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground/50 text-center mt-6">
          © 2024 Echoes of Vietnam — Team Tryyourbest
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
