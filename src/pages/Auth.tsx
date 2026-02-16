import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Divider } from "@/components/auth/Divider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable";
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

  const handleSubmit = async (data: { email: string; password: string; username?: string }) => {
    setIsLoading(true);
    try {
      if (mode === "register") {
        const username = data.username?.trim().toLowerCase();
        const email = data.email.trim().toLowerCase();

        // Validate username format
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

        // Validate email format
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          toast({ title: "Email không hợp lệ", description: "Vui lòng nhập đúng định dạng email.", variant: "destructive" });
          setIsLoading(false);
          return;
        }

        // Validate password
        if (data.password.length < 6) {
          toast({ title: "Mật khẩu quá ngắn", description: "Mật khẩu cần tối thiểu 6 ký tự.", variant: "destructive" });
          setIsLoading(false);
          return;
        }

        // Check if username already exists
        const { data: usernameExists, error: checkError } = await supabase.rpc("check_username_exists", { p_username: username });
        if (checkError) {
          toast({ title: "Lỗi kiểm tra", description: "Không thể kiểm tra tên đăng nhập. Vui lòng thử lại.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        if (usernameExists) {
          toast({ title: "Tên đăng nhập đã tồn tại", description: "Vui lòng chọn tên đăng nhập khác.", variant: "destructive" });
          setIsLoading(false);
          return;
        }

        // Sign up - Supabase Auth handles email uniqueness automatically
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password: data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { username },
          },
        });

        if (error) {
          if (error.message.includes("already registered") || error.message.includes("already been registered")) {
            toast({ title: "Email đã được đăng ký", description: "Email này đã có tài khoản. Vui lòng đăng nhập hoặc dùng email khác.", variant: "destructive" });
          } else {
            toast({ title: "Lỗi đăng ký", description: error.message, variant: "destructive" });
          }
          setIsLoading(false);
          return;
        }

        // Check for fake signups (user_repeated_signup returns user but no session)
        if (signUpData?.user && !signUpData?.session && signUpData.user.identities?.length === 0) {
          toast({ title: "Email đã được đăng ký", description: "Email này đã có tài khoản. Vui lòng đăng nhập hoặc dùng email khác.", variant: "destructive" });
          setIsLoading(false);
          return;
        }

        toast({
          title: "🎉 Đăng ký thành công!",
          description: "Vui lòng kiểm tra email để xác nhận tài khoản trước khi đăng nhập.",
        });
      } else {
        // Login flow
        let email = data.email.trim();

        if (!email) {
          toast({ title: "Vui lòng nhập email hoặc tên đăng nhập", variant: "destructive" });
          setIsLoading(false);
          return;
        }

        if (!data.password) {
          toast({ title: "Vui lòng nhập mật khẩu", variant: "destructive" });
          setIsLoading(false);
          return;
        }

        // If no @, treat as username lookup
        if (!email.includes("@")) {
          const { data: result, error: lookupError } = await supabase.rpc("get_email_by_username", { p_username: email });
          if (lookupError || !result) {
            toast({ title: "Không tìm thấy tài khoản", description: "Tên đăng nhập không tồn tại. Vui lòng kiểm tra lại.", variant: "destructive" });
            setIsLoading(false);
            return;
          }
          email = result;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: data.password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({ title: "Sai thông tin đăng nhập", description: "Email/tên đăng nhập hoặc mật khẩu không đúng.", variant: "destructive" });
          } else if (error.message.includes("Email not confirmed")) {
            toast({ title: "Email chưa xác nhận", description: "Vui lòng kiểm tra hộp thư và xác nhận email trước khi đăng nhập.", variant: "destructive" });
          } else {
            toast({ title: "Lỗi đăng nhập", description: error.message, variant: "destructive" });
          }
          setIsLoading(false);
          return;
        }

        toast({ title: "Đăng nhập thành công! 👋", description: "Chào mừng bạn trở lại Echoes of Vietnam!" });
        navigate("/timeline");
      }
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message || "Đã có lỗi xảy ra. Vui lòng thử lại.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: "Lỗi đăng nhập Google", description: error.message || "Không thể kết nối với Google. Vui lòng thử lại.", variant: "destructive" });
      setIsLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center overflow-hidden">
      {/* Background Vietnam map */}
      <div className="absolute inset-0">
        <img
          src={vietnamMap}
          alt=""
          className="absolute right-0 top-1/2 -translate-y-1/2 h-[120%] w-auto object-cover opacity-[0.04]"
        />
        <div className="absolute inset-0 dong-son-pattern opacity-[0.03]" />
        <div className="absolute inset-0 heritage-pattern opacity-[0.02]" />
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
              {isLogin
                ? "Đăng nhập bằng email hoặc tên đăng nhập."
                : "Tạo tài khoản để khám phá lịch sử Việt Nam."}
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
        <p className="text-xs text-muted-foreground/40 text-center mt-6">
          © 2026 Echoes of Vietnam — Team Tryyourbest
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
