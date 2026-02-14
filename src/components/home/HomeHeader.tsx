import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";

const HomeHeader = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-foreground/95 backdrop-blur-sm border-b border-primary-foreground/10">
      <div className="container mx-auto px-6 md:px-12 py-4">
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
            <span className="text-lg font-semibold text-primary-foreground">
              Echoes of <span className="italic text-accent">Vietnam</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Tính năng", href: "#features" },
              { label: "Timeline", href: "#timeline" },
              { label: "Nhóm", href: "#team" },
              { label: "Về dự án", href: "#about" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {user ? (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/profile")}
                className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 text-sm gap-2"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {user.user_metadata?.full_name || user.email?.split("@")[0] || "Profile"}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => { await signOut(); }}
                className="text-primary-foreground/50 hover:text-primary-foreground hover:bg-primary-foreground/10 w-8 h-8"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
              className="text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground hover:text-foreground text-sm"
            >
              Đăng nhập
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
