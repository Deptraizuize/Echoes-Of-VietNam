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

  const handleSubmit = async (data: { email: string; password: string; name?: string }) => {
    setIsLoading(true);
    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: data.name || "" },
          },
        });
        if (error) throw error;
        toast({ title: "Đăng ký thành công!", description: "Vui lòng kiểm tra email để xác nhận tài khoản." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
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
    <div className="min-h-screen bg-foreground flex">
      {/* Left Side - Vietnam Map Hero */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        {/* Vietnam map as background */}
        <img
          src={vietnamMap}
          alt="Bản đồ Việt Nam"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/40 via-transparent to-foreground/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-foreground/50" />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-16 w-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 w-10 h-10 self-start"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 flex flex-col justify-end pb-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <img src={logo} alt="Logo" className="w-14 h-14 xl:w-16 xl:h-16 rounded-xl object-contain" />
              <div>
                <h1 className="text-primary-foreground text-3xl xl:text-4xl font-bold">
                  Echoes of <span className="italic text-accent">Vietnam</span>
                </h1>
                <div className="w-12 h-0.5 bg-accent rounded-full mt-2" />
              </div>
            </div>

            <p className="text-primary-foreground/50 max-w-md text-base xl:text-lg leading-relaxed mb-8">
              Hành trình khám phá lịch sử hào hùng của dân tộc Việt Nam qua hơn 4000 năm văn hiến
            </p>

            <div className="flex items-center gap-10">
              {[
                { value: "4000+", label: "Năm lịch sử" },
                { value: "5", label: "Thời kỳ" },
                { value: "41", label: "Cột mốc" },
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-2xl xl:text-3xl text-accent font-bold">{stat.value}</div>
                  <div className="text-primary-foreground/40 text-xs xl:text-sm mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="text-xs text-primary-foreground/25">
            © 2024 Echoes of Vietnam — Team Tryyourbest
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-20 bg-background"
      >
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile Header */}
          <div className="lg:hidden mb-10">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="mb-6">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="w-12 h-12 rounded-lg object-contain" />
              <div>
                <span className="text-xl font-bold">Echoes of </span>
                <span className="text-xl font-bold italic text-accent">Vietnam</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl xl:text-3xl font-bold text-foreground mb-2">
              {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
            </h2>
            <p className="text-muted-foreground">
              {isLogin ? "Chào mừng trở lại! Đăng nhập để tiếp tục." : "Tạo tài khoản để khám phá lịch sử Việt Nam."}
            </p>
          </div>

          <GoogleButton onClick={handleGoogleLogin} isLoading={isLoading} />
          <Divider />
          <AuthForm mode={mode} onSubmit={handleSubmit} isLoading={isLoading} />

          <div className="mt-8 text-center">
            <button onClick={() => setMode(isLogin ? "register" : "login")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {isLogin ? (
                <>Chưa có tài khoản? <span className="text-accent font-medium hover:underline underline-offset-4">Đăng ký ngay</span></>
              ) : (
                <>Đã có tài khoản? <span className="text-accent font-medium hover:underline underline-offset-4">Đăng nhập</span></>
              )}
            </button>
          </div>

          {!isLogin && (
            <p className="text-xs text-muted-foreground text-center mt-6 leading-relaxed">
              Bằng việc đăng ký, bạn đồng ý với{" "}
              <a href="#" className="text-foreground hover:text-accent transition-colors">Điều khoản</a> và{" "}
              <a href="#" className="text-foreground hover:text-accent transition-colors">Chính sách bảo mật</a>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
