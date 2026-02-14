import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import UserHeader from "@/components/layout/UserHeader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Gift, Star, Trophy, ArrowLeft, Crown, ShoppingBag, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  points_cost: number;
  image_url: string | null;
  reward_type: string;
  stock: number | null;
}

interface Redemption {
  id: string;
  reward_id: string;
  points_spent: number;
  status: string;
  created_at: string;
}

interface LeaderboardEntry {
  display_name: string | null;
  total_points: number;
  is_premium: boolean;
}

const Rewards = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myPoints, setMyPoints] = useState(0);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchAll();
  }, [user, authLoading]);

  const fetchAll = async () => {
    const [{ data: rewardsData }, { data: redemptionsData }, { data: profileData }, { data: lbData }] = await Promise.all([
      supabase.from("rewards").select("*").eq("is_active", true).order("points_cost"),
      supabase.from("reward_redemptions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("total_points").eq("user_id", user!.id).single(),
      supabase.from("profiles").select("display_name, total_points, is_premium").order("total_points", { ascending: false }).limit(20),
    ]);
    if (rewardsData) setRewards(rewardsData);
    if (redemptionsData) setRedemptions(redemptionsData);
    if (profileData) setMyPoints(profileData.total_points);
    if (lbData) setLeaderboard(lbData);
  };

  const redeemReward = async (reward: Reward) => {
    if (myPoints < reward.points_cost) {
      toast({ title: "Không đủ điểm", description: `Cần ${reward.points_cost} điểm, bạn có ${myPoints} điểm.`, variant: "destructive" });
      return;
    }
    setRedeeming(reward.id);
    const { error } = await supabase.from("reward_redemptions").insert({
      user_id: user!.id,
      reward_id: reward.id,
      points_spent: reward.points_cost,
    });
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      // Deduct points
      await supabase.from("profiles").update({ total_points: myPoints - reward.points_cost }).eq("user_id", user!.id);
      toast({ title: "Đã đổi thưởng!", description: "Yêu cầu sẽ được admin xử lý." });
      fetchAll();
    }
    setRedeeming(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusText: Record<string, string> = { pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Từ chối", delivered: "Đã giao" };

  return (
    <div className="min-h-screen bg-background">
      <UserHeader />
      <main className="container mx-auto px-4 md:px-12 py-8 md:py-16 max-w-5xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">Đổi thưởng</h1>
              <p className="text-muted-foreground text-sm">Dùng điểm tích lũy để nhận phần thưởng hấp dẫn.</p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="font-bold text-accent">{myPoints}</span>
                <span className="text-sm text-muted-foreground">điểm hiện có</span>
              </div>
            </div>

            {/* Rewards Grid */}
            {rewards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {rewards.map((reward, i) => (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-card border border-border rounded-xl overflow-hidden hover:border-accent/30 transition-colors"
                  >
                    {reward.image_url ? (
                      <img src={reward.image_url} alt={reward.title} className="w-full h-36 object-cover" />
                    ) : (
                      <div className="w-full h-36 bg-muted flex items-center justify-center">
                        <Gift className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="font-semibold text-foreground mb-1">{reward.title}</h4>
                      {reward.description && (
                        <p className="text-xs text-muted-foreground mb-3">{reward.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-sm font-bold text-accent">
                          <Star className="w-3.5 h-3.5 fill-accent" /> {reward.points_cost}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => redeemReward(reward)}
                          disabled={myPoints < reward.points_cost || redeeming === reward.id}
                          className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                          {redeeming === reward.id ? "..." : "Đổi"}
                        </Button>
                      </div>
                      {reward.stock !== null && (
                        <p className="text-[10px] text-muted-foreground mt-2">Còn {reward.stock} phần</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Chưa có phần thưởng nào. Hãy quay lại sau!</p>
              </div>
            )}

            {/* My Redemptions */}
            {redemptions.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Lịch sử đổi thưởng</h3>
                <div className="space-y-2">
                  {redemptions.map((r) => (
                    <div key={r.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-3">
                      <div>
                        <span className="text-sm text-foreground">{r.points_spent} điểm</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(r.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        r.status === "approved" || r.status === "delivered"
                          ? "bg-accent/10 text-accent"
                          : r.status === "rejected"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {statusText[r.status] || r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Leaderboard Sidebar */}
          <div className="w-full md:w-72 flex-shrink-0">
            <div className="bg-card border border-border rounded-xl p-5 sticky top-20">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" /> Bảng xếp hạng
              </h3>
              <div className="space-y-3">
                {leaderboard.map((entry, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0 ? "bg-accent text-accent-foreground" :
                      i === 1 ? "bg-accent/60 text-accent-foreground" :
                      i === 2 ? "bg-accent/30 text-foreground" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {entry.display_name || "Ẩn danh"}
                        {entry.is_premium && <Crown className="w-3 h-3 text-accent inline ml-1" />}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-accent">{entry.total_points}</span>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">Chưa có dữ liệu</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Rewards;
