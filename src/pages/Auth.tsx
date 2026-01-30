import { useState } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Divider } from "@/components/auth/Divider";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: { email: string; password: string; name?: string }) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast({
      title: mode === "login" ? "Đăng nhập thành công!" : "Đăng ký thành công!",
      description: `Chào mừng bạn đến với Echoes of Vietnam${data.name ? `, ${data.name}` : ""}!`,
    });
    
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    // Simulate Google OAuth
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast({
      title: "Đăng nhập Google thành công!",
      description: "Chào mừng bạn đến với Echoes of Vietnam!",
    });
    
    setIsLoading(false);
  };

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-gradient-heritage heritage-pattern flex items-center justify-center p-4 md:p-8">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo Section */}
        <div className="text-center mb-8 fade-in-up">
          <div className="inline-block float-gentle">
            <img
              src={logo}
              alt="Echoes of Vietnam"
              className="w-32 h-32 md:w-40 md:h-40 mx-auto object-contain drop-shadow-lg"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary mt-4">
            Echoes of Vietnam
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Khám phá lịch sử hào hùng của dân tộc
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-card rounded-2xl shadow-elevated p-6 md:p-8 border border-border/50 backdrop-blur-sm fade-in-up delay-200">
          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-secondary p-1 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                isLogin
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                !isLogin
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Đăng ký
            </button>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-serif font-semibold text-foreground">
              {isLogin ? "Chào mừng trở lại!" : "Tạo tài khoản mới"}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {isLogin
                ? "Đăng nhập để tiếp tục hành trình khám phá"
                : "Tham gia cùng cộng đồng yêu lịch sử Việt Nam"}
            </p>
          </div>

          {/* Google Button */}
          <GoogleButton onClick={handleGoogleLogin} isLoading={isLoading} />

          {/* Divider */}
          <Divider />

          {/* Auth Form */}
          <AuthForm mode={mode} onSubmit={handleSubmit} isLoading={isLoading} />

          {/* Terms */}
          {!isLogin && (
            <p className="text-xs text-muted-foreground text-center mt-6 fade-in-up">
              Bằng việc đăng ký, bạn đồng ý với{" "}
              <a href="#" className="text-accent hover:underline">
                Điều khoản sử dụng
              </a>{" "}
              và{" "}
              <a href="#" className="text-accent hover:underline">
                Chính sách bảo mật
              </a>
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6 fade-in-up delay-400">
          © 2024 Echoes of Vietnam. Giữ gìn và lan tỏa lịch sử Việt Nam.
        </p>
      </div>
    </div>
  );
};

export default Auth;
