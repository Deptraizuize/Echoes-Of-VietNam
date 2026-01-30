import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Divider } from "@/components/auth/Divider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";

const Auth = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground relative overflow-hidden">
        <div className="absolute inset-0 heritage-pattern opacity-10" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center">
            <img
              src={logo}
              alt="Echoes of Vietnam"
              className="w-40 h-40 object-contain mb-10 float-gentle"
            />
            <h1 className="text-primary-foreground text-center mb-4">
              Echoes of
              <br />
              <span className="italic">Vietnam</span>
            </h1>
            <p className="text-primary-foreground/50 text-center max-w-sm text-lg">
              Hành trình khám phá lịch sử hào hùng của dân tộc
            </p>
          </div>
          
          <div className="text-sm text-primary-foreground/30">
            © 2024 Echoes of Vietnam
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile Header */}
          <div className="lg:hidden mb-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-4">
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
              <span className="font-serif text-xl">Echoes of Vietnam</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="font-serif text-3xl text-foreground mb-2">
              {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
            </h2>
            <p className="text-muted-foreground">
              {isLogin
                ? "Chào mừng trở lại! Đăng nhập để tiếp tục."
                : "Tạo tài khoản để khám phá lịch sử Việt Nam."}
            </p>
          </div>

          {/* Google Button */}
          <GoogleButton onClick={handleGoogleLogin} isLoading={isLoading} />

          {/* Divider */}
          <Divider />

          {/* Auth Form */}
          <AuthForm mode={mode} onSubmit={handleSubmit} isLoading={isLoading} />

          {/* Toggle */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setMode(isLogin ? "register" : "login")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? (
                <>
                  Chưa có tài khoản?{" "}
                  <span className="text-foreground font-medium underline underline-offset-4">
                    Đăng ký ngay
                  </span>
                </>
              ) : (
                <>
                  Đã có tài khoản?{" "}
                  <span className="text-foreground font-medium underline underline-offset-4">
                    Đăng nhập
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Terms */}
          {!isLogin && (
            <p className="text-xs text-muted-foreground text-center mt-6">
              Bằng việc đăng ký, bạn đồng ý với{" "}
              <a href="#" className="text-foreground hover:underline">
                Điều khoản
              </a>{" "}
              và{" "}
              <a href="#" className="text-foreground hover:underline">
                Chính sách bảo mật
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
