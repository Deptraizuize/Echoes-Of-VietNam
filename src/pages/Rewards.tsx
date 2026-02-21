import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import UserHeader from "@/components/layout/UserHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Gift, Star, Trophy, ArrowLeft, Crown, ShoppingBag, Clock,
  CheckCircle, Award, Shield, Lock, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BadgeReq {
  badge_type: string;
  id: string;
  name?: string;
}

interface Reward {
  id: string;
  title: string;
  description: string | null;
  points_cost: number;
  image_url: string | null;
  reward_type: string;
  stock: number | null;
  required_badges: BadgeReq[] | null;
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

interface UserBadge {
  badge_type: string;
  milestone_id: string;
  phase_id: string | null;
  period_id: string | null;
}

const BADGE_TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  milestone: { icon: <Award className="w-3 h-3" />, label: "Mốc", color: "bg-accent/10 text-accent border-accent/20" },
  phase: { icon: <Shield className="w-3 h-3" />, label: "Giai đoạn", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  period: { icon: <Crown className="w-3 h-3" />, label: "Thời kỳ", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
};

const Rewards = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myPoints, setMyPoints] = useState(0);
  const [myBadges, setMyBadges] = useState<UserBadge[]>([]);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [confirmReward, setConfirmReward] = useState<Reward | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/auth"); return; }
    if (user) fetchAll();
  }, [user, authLoading]);

  // Realtime subscriptions
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("rewards-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "reward_redemptions", filter: `user_id=eq.${user.id}` }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "rewards" }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchAll = async () => {
    const [{ data: rewardsData }, { data: redemptionsData }, { data: profileData }, { data: lbData }, { data: badgesData }] = await Promise.all([
      supabase.from("rewards").select("*").eq("is_active", true).order("points_cost"),
      supabase.from("reward_redemptions").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("total_points").eq("user_id", user!.id).single(),
      supabase.rpc("get_leaderboard"),
      supabase.from("badges").select("badge_type, milestone_id, phase_id, period_id"),
    ]);
    if (rewardsData) setRewards(rewardsData.map(r => ({ ...r, required_badges: (r as any).required_badges || [] })));
    if (redemptionsData) setRedemptions(redemptionsData as any);
    if (profileData) setMyPoints(profileData.total_points);
    if (lbData) setLeaderboard(lbData as any);
    if (badgesData) setMyBadges(badgesData as any);
  };

  const hasBadge = (req: BadgeReq): boolean => {
    if (req.badge_type === "milestone") return myBadges.some(b => b.badge_type === "milestone" && b.milestone_id === req.id);
    if (req.badge_type === "phase") return myBadges.some(b => b.badge_type === "phase" && b.phase_id === req.id);
    if (req.badge_type === "period") return myBadges.some(b => b.badge_type === "period" && b.period_id === req.id);
    return false;
  };

  const hasAllBadges = (reqs: BadgeReq[] | null): boolean => {
    if (!reqs || reqs.length === 0) return true;
    return reqs.every(hasBadge);
  };

  const redeemReward = async (reward: Reward) => {
    setRedeeming(reward.id);
    setConfirmReward(null);
    const { data, error } = await supabase.rpc("redeem_reward", { p_reward_id: reward.id });
    if (error) {
      toast({ title: "Lỗi hệ thống", description: error.message, variant: "destructive" });
    } else if (data && typeof data === "object" && "error" in (data as any)) {
      toast({ title: "Không thể đổi", description: (data as any).error, variant: "destructive" });
    } else {
      toast({ title: "🎉 Đổi thưởng thành công!", description: `Đã trừ ${reward.points_cost} điểm. Admin sẽ xử lý yêu cầu của bạn.` });
      fetchAll();
    }
    setRedeeming(null);
  };

  const canRedeem = (reward: Reward): { ok: boolean; reason?: string } => {
    if (myPoints < reward.points_cost) return { ok: false, reason: "Không đủ điểm" };
    if (reward.stock !== null && reward.stock <= 0) return { ok: false, reason: "Đã hết" };
    if (!hasAllBadges(reward.required_badges)) return { ok: false, reason: "Thiếu huy hiệu" };
    return { ok: true };
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusConfig: Record<string, { text: string; className: string }> = {
    pending: { text: "Chờ duyệt", className: "bg-muted text-muted-foreground" },
    approved: { text: "Đã duyệt", className: "bg-accent/10 text-accent" },
    rejected: { text: "Từ chối", className: "bg-destructive/10 text-destructive" },
    delivered: { text: "Đã giao", className: "bg-green-500/10 text-green-600" },
  };

  const getRewardTitle = (id: string) => rewards.find(r => r.id === id)?.title || "Phần thưởng";

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 dong-son-pattern opacity-[0.03] pointer-events-none" />
      <UserHeader />

      <main className="container mx-auto px-4 md:px-12 py-8 md:py-16 max-w-6xl relative z-10">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">Đổi thưởng</h1>
          <p className="text-muted-foreground text-sm mb-4">Dùng điểm và huy hiệu để nhận phần thưởng hấp dẫn.</p>
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent/10 rounded-xl border border-accent/20">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="font-bold text-accent text-lg">{myPoints}</span>
              <span className="text-sm text-muted-foreground">điểm</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-muted/50 rounded-xl border border-border">
              <Award className="w-4 h-4 text-accent" />
              <span className="font-bold text-foreground">{myBadges.length}</span>
              <span className="text-sm text-muted-foreground">huy hiệu</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main */}
          <div className="flex-1">
            {/* Rewards Grid */}
            {rewards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                {rewards.map((reward, i) => {
                  const { ok, reason } = canRedeem(reward);
                  const badgeReqs = reward.required_badges || [];
                  return (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={`group bg-card border rounded-xl overflow-hidden transition-all ${ok ? "border-border hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5" : "border-border/50 opacity-75"}`}
                    >
                      {/* Image */}
                      <div className="relative">
                        {reward.image_url ? (
                          <img src={reward.image_url} alt={reward.title} className="w-full h-40 object-cover" />
                        ) : (
                          <div className="w-full h-40 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                            <Gift className="w-12 h-12 text-muted-foreground/30" />
                          </div>
                        )}
                        {/* Type badge */}
                        <div className="absolute top-2 left-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground border border-border/50 capitalize">
                            {reward.reward_type}
                          </span>
                        </div>
                        {/* Stock */}
                        {reward.stock !== null && (
                          <div className="absolute top-2 right-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm border ${reward.stock > 0 ? "bg-background/80 text-muted-foreground border-border/50" : "bg-destructive/80 text-destructive-foreground border-destructive/50"}`}>
                              {reward.stock > 0 ? `Còn ${reward.stock}` : "Hết"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-3">
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">{reward.title}</h4>
                          {reward.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{reward.description}</p>
                          )}
                        </div>

                        {/* Badge requirements */}
                        {badgeReqs.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Yêu cầu huy hiệu</p>
                            <div className="flex flex-wrap gap-1.5">
                              {badgeReqs.map((req, j) => {
                                const has = hasBadge(req);
                                const cfg = BADGE_TYPE_CONFIG[req.badge_type] || BADGE_TYPE_CONFIG.milestone;
                                return (
                                  <span
                                    key={j}
                                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-colors ${has ? cfg.color : "bg-muted/50 text-muted-foreground/50 border-border/30 line-through"}`}
                                  >
                                    {has ? cfg.icon : <Lock className="w-2.5 h-2.5" />}
                                    {req.name || req.id}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Action */}
                        <div className="flex items-center justify-between pt-1 border-t border-border/50">
                          <span className="flex items-center gap-1 text-sm font-bold text-accent">
                            <Star className="w-3.5 h-3.5 fill-accent" /> {reward.points_cost}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => setConfirmReward(reward)}
                            disabled={!ok || redeeming === reward.id}
                            className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs gap-1.5"
                          >
                            {redeeming === reward.id ? (
                              <div className="w-3 h-3 border border-accent-foreground border-t-transparent rounded-full animate-spin" />
                            ) : !ok ? (
                              <><Lock className="w-3 h-3" /> {reason}</>
                            ) : (
                              <><ShoppingBag className="w-3 h-3" /> Đổi</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <Gift className="w-14 h-14 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Chưa có phần thưởng nào. Hãy quay lại sau!</p>
              </div>
            )}

            {/* Redemption History */}
            {redemptions.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" /> Lịch sử đổi thưởng
                </h3>
                <div className="space-y-2">
                  {redemptions.map((r) => {
                    const sc = statusConfig[r.status] || statusConfig.pending;
                    return (
                      <div key={r.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Gift className="w-4 h-4 text-accent" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{getRewardTitle(r.reward_id)}</p>
                            <p className="text-xs text-muted-foreground">
                              {r.points_spent} điểm · {new Date(r.created_at).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${sc.className}`}>
                          {sc.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Leaderboard Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
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

      {/* Confirm Dialog */}
      <AlertDialog open={!!confirmReward} onOpenChange={(open) => !open && setConfirmReward(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-accent" /> Xác nhận đổi thưởng
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Bạn muốn đổi <strong>{confirmReward?.title}</strong>?</p>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-sm">Trừ <strong className="text-accent">{confirmReward?.points_cost}</strong> điểm</span>
                  <span className="text-xs text-muted-foreground ml-auto">Còn lại: {myPoints - (confirmReward?.points_cost || 0)}</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmReward && redeemReward(confirmReward)}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <ShoppingBag className="w-4 h-4 mr-1" /> Đổi thưởng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Rewards;
