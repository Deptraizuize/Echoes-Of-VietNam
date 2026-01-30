import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (data: { email: string; password: string; name?: string }) => void;
  isLoading?: boolean;
}

export const AuthForm = ({ mode, onSubmit, isLoading }: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isLogin = mode === "login";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name field - only for registration */}
      {!isLogin && (
        <div className="space-y-2 fade-in-up delay-100">
          <Label htmlFor="name" className="text-sm font-medium text-foreground">
            Họ và tên
          </Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="Nguyễn Văn A"
              className="pl-12"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
        </div>
      )}

      {/* Email field */}
      <div className="space-y-2 fade-in-up delay-200">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="example@gmail.com"
            className="pl-12"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Password field */}
      <div className="space-y-2 fade-in-up delay-300">
        <Label htmlFor="password" className="text-sm font-medium text-foreground">
          Mật khẩu
        </Label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-12 pr-12"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Forgot password - only for login */}
      {isLogin && (
        <div className="flex justify-end fade-in-up delay-300">
          <button
            type="button"
            className="text-sm text-accent hover:text-accent/80 transition-colors font-medium"
          >
            Quên mật khẩu?
          </button>
        </div>
      )}

      {/* Submit button */}
      <div className="pt-2 fade-in-up delay-400">
        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
              Đang xử lý...
            </div>
          ) : isLogin ? (
            "Đăng nhập"
          ) : (
            "Tạo tài khoản"
          )}
        </Button>
      </div>
    </form>
  );
};
