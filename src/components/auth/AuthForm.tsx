import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

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
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-foreground">
            Họ và tên
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Nguyễn Văn A"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="h-12 border-border bg-background"
          />
        </div>
      )}

      {/* Email field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="example@gmail.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="h-12 border-border bg-background"
        />
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-foreground">
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
            className="h-12 pr-12 border-border bg-background"
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
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
          className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-medium uppercase tracking-widest text-sm group"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
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
