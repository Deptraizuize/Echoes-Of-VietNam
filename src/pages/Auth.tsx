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
      {/* Left Side - Branding with Enhanced Design */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Layered Background */}
        <div className="absolute inset-0 bg-foreground" />
        <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-accent/20" />
        
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Back Button */}
          <div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Center Content - Logo & Text */}
          <div className="flex-1 flex flex-col justify-center items-center px-8">
            {/* Logo Container with Glow Effect */}
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-accent/30 blur-3xl rounded-full scale-150" />
              <div className="relative bg-gradient-to-br from-accent/20 to-accent/5 p-8 rounded-3xl backdrop-blur-sm border border-primary-foreground/10">
                <img
                  src={logo}
                  alt="Echoes of Vietnam"
                  className="w-32 h-32 object-contain float-gentle"
                />
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-primary-foreground text-center mb-6">
              <span className="block text-4xl md:text-5xl lg:text-6xl">Echoes of</span>
              <span className="block text-5xl md:text-6xl lg:text-7xl italic text-gradient-gold mt-2">
                Vietnam
              </span>
            </h1>
            
            {/* Accent Bar */}
            <div className="w-20 h-1 bg-accent rounded-full mb-8" />
            
            {/* Description */}
            <p className="text-primary-foreground/60 text-center max-w-md text-lg leading-relaxed">
              Hành trình khám phá lịch sử hào hùng của dân tộc Việt Nam qua các thời kỳ
            </p>
            
            {/* Stats Row */}
            <div className="flex items-center gap-12 mt-12">
              <div className="text-center">
                <div className="text-3xl font-serif text-accent">4000+</div>
                <div className="text-primary-foreground/40 text-sm mt-1">Năm lịch sử</div>
              </div>
              <div className="w-px h-12 bg-primary-foreground/20" />
              <div className="text-center">
                <div className="text-3xl font-serif text-accent">13</div>
                <div className="text-primary-foreground/40 text-sm mt-1">Thời kỳ</div>
              </div>
              <div className="w-px h-12 bg-primary-foreground/20" />
              <div className="text-center">
                <div className="text-3xl font-serif text-accent">100+</div>
                <div className="text-primary-foreground/40 text-sm mt-1">Sự kiện</div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-sm text-primary-foreground/30 text-center">
            © 2024 Echoes of Vietnam • Team Tryyourbest
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-background">
        <div className="mx-auto w-full max-w-[400px]">
          {/* Mobile Header */}
          <div className="lg:hidden mb-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="mb-8"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full" />
                <div className="relative bg-muted/50 p-4 rounded-2xl">
                  <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
                </div>
              </div>
              <div className="text-center">
                <span className="font-serif text-2xl">Echoes of </span>
                <span className="font-serif text-2xl italic text-accent">Vietnam</span>
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center lg:text-left mb-10">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
              {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
            </h2>
            <p className="text-muted-foreground text-base">
              {isLogin
                ? "Chào mừng trở lại! Đăng nhập để tiếp tục hành trình."
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
          <div className="mt-10 text-center">
            <button
              onClick={() => setMode(isLogin ? "register" : "login")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? (
                <>
                  Chưa có tài khoản?{" "}
                  <span className="text-accent font-medium hover:underline underline-offset-4">
                    Đăng ký ngay
                  </span>
                </>
              ) : (
                <>
                  Đã có tài khoản?{" "}
                  <span className="text-accent font-medium hover:underline underline-offset-4">
                    Đăng nhập
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Terms */}
          {!isLogin && (
            <p className="text-xs text-muted-foreground text-center mt-8 leading-relaxed">
              Bằng việc đăng ký, bạn đồng ý với{" "}
              <a href="#" className="text-foreground hover:text-accent transition-colors">
                Điều khoản sử dụng
              </a>{" "}
              và{" "}
              <a href="#" className="text-foreground hover:text-accent transition-colors">
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
