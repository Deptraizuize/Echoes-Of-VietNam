import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, Star, LogOut, Shield, Gift, Crown } from "lucide-react";
import logo from "@/assets/logo.png";

const UserHeader = () => {
  const { user, signOut, isAdmin, isPremium, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [hearts, setHearts] = useState<number | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (authLoading || !user) { setDataLoaded(false); return; }

    const fetchUserData = async () => {
      const [heartsRes, profileRes] = await Promise.all([
        supabase.rpc("get_hearts"),
        supabase.from("profiles").select("total_points").eq("user_id", user.id).single(),
      ]);

      if (heartsRes.data && heartsRes.data.length > 0) {
        setHearts(heartsRes.data[0].hearts_remaining);
      }
      if (profileRes.data) {
        setPoints(profileRes.data.total_points);
      }
      setDataLoaded(true);
    };

    fetchUserData();
  }, [user, authLoading]);

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
            <img src={logo} alt="Logo" className="w-9 h-9 rounded-lg object-contain" />
            <span className="font-serif text-lg text-foreground hidden sm:block">
              Echoes of <span className="italic text-accent">Vietnam</span>
            </span>
          </div>

          <nav className="flex items-center gap-1.5 sm:gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/timeline")} className="text-xs sm:text-sm px-2 sm:px-3">
              Timeline
            </Button>

            {user && dataLoaded && !isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/feedback")} className="text-xs sm:text-sm px-2 sm:px-3 hidden sm:inline-flex">
                Góp ý
              </Button>
            )}

            {user && dataLoaded ? (
              <>
                {!isAdmin && (
                  <>
                    {hearts !== null && (
                      <div className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-destructive/10 rounded-full">
                        <Heart className="w-3.5 h-3.5 text-destructive fill-destructive" />
                        <span className="text-xs sm:text-sm font-medium text-destructive">{hearts}</span>
                      </div>
                    )}
                    <button
                      onClick={() => navigate("/profile")}
                      className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-accent/10 rounded-full hover:bg-accent/20 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                      <span className="text-xs sm:text-sm font-medium text-accent">{points}</span>
                    </button>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/rewards")} className="text-xs sm:text-sm px-2 sm:px-3 hidden sm:inline-flex">
                      <Gift className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Đổi thưởng</span>
                    </Button>
                    {!isPremium && (
                      <Button variant="ghost" size="sm" onClick={() => navigate("/upgrade")} className="text-xs sm:text-sm px-2 sm:px-3 hidden md:inline-flex text-accent">
                        <Crown className="w-4 h-4 mr-1" /> Nâng cấp
                      </Button>
                    )}
                  </>
                )}

                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="text-sm">
                    <Shield className="w-4 h-4 mr-1" /> Admin
                  </Button>
                )}

                <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="text-sm">
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
