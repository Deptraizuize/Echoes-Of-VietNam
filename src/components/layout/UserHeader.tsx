import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, Star, LogOut, Shield } from "lucide-react";
import logo from "@/assets/logo.png";

const UserHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [hearts, setHearts] = useState<number | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      // Get hearts
      const { data: heartsData } = await supabase.rpc("get_hearts");
      if (heartsData && heartsData.length > 0) {
        setHearts(heartsData[0].hearts_remaining);
      }

      // Get points
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_points")
        .eq("user_id", user.id)
        .single();
      if (profile) setPoints(profile.total_points);

      // Check admin
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (roles?.some((r) => r.role === "admin")) setIsAdmin(true);
    };

    fetchUserData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 md:px-12 py-3">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border border-accent/30 bg-muted flex items-center justify-center">
              <img src={logo} alt="Logo" className="w-7 h-7 object-contain" />
            </div>
            <span className="font-serif text-lg text-foreground hidden sm:block">
              Echoes of <span className="italic text-accent">Vietnam</span>
            </span>
          </div>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/timeline")}
              className="text-sm"
            >
              Timeline
            </Button>

            {user ? (
              <>
                {/* Hearts */}
                {hearts !== null && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 rounded-full">
                    <Heart className="w-4 h-4 text-destructive fill-destructive" />
                    <span className="text-sm font-medium text-destructive">{hearts}</span>
                  </div>
                )}

                {/* Points */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 rounded-full">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-sm font-medium text-accent">{points}</span>
                </div>

                {/* Admin */}
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/admin")}
                    className="text-sm"
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    Admin
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/auth")}
                className="text-sm"
              >
                Đăng nhập
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
