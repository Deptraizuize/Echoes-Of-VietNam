import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, AtSign } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (data: { email: string; password: string; name?: string; username?: string }) => void;
  isLoading?: boolean;
}

export const AuthForm = ({ mode, onSubmit, isLoading }: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    username: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isLogin = mode === "login";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name field - only for registration */}
      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            Họ và tên
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Nguyễn Văn A"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="h-12 border-border bg-background hover:border-accent/50 focus:border-accent transition-colors"
          />
        </div>
      )}

      {/* Username field - for registration */}
      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium text-foreground flex items-center gap-2">
            <AtSign className="w-4 h-4 text-muted-foreground" />
            Tên đăng nhập
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="nguoiyeusu123"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value.replace(/\s/g, "").toLowerCase() })}
            required
            minLength={3}
            maxLength={30}
            pattern="^[a-z0-9._]+$"
            title="Chỉ chứa chữ thường, số, dấu chấm và gạch dưới"
            className="h-12 border-border bg-background hover:border-accent/50 focus:border-accent transition-colors"
          />
          <p className="text-xs text-muted-foreground">Chữ thường, số, dấu chấm, gạch dưới. 3–30 ký tự.</p>
        </div>
      )}

      {/* Email / Username+Email field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          {isLogin ? "Email hoặc tên đăng nhập" : "Email"}
        </Label>
        <Input
          id="email"
          type={isLogin ? "text" : "email"}
          placeholder={isLogin ? "email hoặc tên đăng nhập" : "example@gmail.com"}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="h-12 border-border bg-background hover:border-accent/50 focus:border-accent transition-colors"
        />
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          Mật khẩu
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
            className="h-12 pr-12 border-border bg-background hover:border-accent/50 focus:border-accent transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Forgot password - only for login */}
      {isLogin && (
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            Quên mật khẩu?
          </button>
        </div>
      )}

      {/* Submit button */}
      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 font-medium text-sm tracking-wide group shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all duration-300"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
              Đang xử lý...
            </div>
          ) : (
            <>
              {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
