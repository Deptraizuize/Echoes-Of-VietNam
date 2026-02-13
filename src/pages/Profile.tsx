import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import UserHeader from "@/components/layout/UserHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award, Star, Heart, Trophy, Clock, CheckCircle2, XCircle,
  ArrowRight, User, Crown, Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileData {
  display_name: string | null;
  total_points: number;
  is_premium: boolean;
  created_at: string;
}

interface BadgeData {
  id: string;
  badge_name: string;
  badge_icon: string | null;
  earned_at: string;
  milestone_id: string;
}

interface QuizAttempt {
  id: string;
  milestone_id: string;
  quiz_score: number;
  points_earned: number;
  hearts_lost: number;
  double_points_used: boolean;
  created_at: string;
}

interface ProgressData {
  milestone_id: string;
  is_completed: boolean;
  best_score: number | null;
  attempts_count: number;
  completed_at: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [hearts, setHearts] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }

    const fetchAll = async () => {
      const [profileRes, badgesRes, attemptsRes, progressRes, heartsRes] = await Promise.all([
        supabase.from("profiles").select("display_name, total_points, is_premium, created_at").eq("user_id", user.id).single(),
        supabase.from("badges").select("*").order("earned_at", { ascending: false }),
        supabase.from("quiz_attempts").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("user_progress").select("*"),
        supabase.rpc("get_hearts"),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (badgesRes.data) setBadges(badgesRes.data);
      if (attemptsRes.data) setAttempts(attemptsRes.data);
      if (progressRes.data) setProgress(progressRes.data);
      if (heartsRes.data && heartsRes.data.length > 0) setHearts(heartsRes.data[0].hearts_remaining);
      setLoading(false);
    };
    fetchAll();
  }, [user, authLoading, navigate]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const completedCount = progress.filter((p) => p.is_completed).length;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      <UserHeader />

      {/* Hero */}
      <section className="relative py-16 md:py-20 px-6 md:px-12 bg-foreground text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 heritage-pattern opacity-5" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row items-start md:items-center gap-6"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center">
                <User className="w-10 h-10 text-accent" />
              </div>
              {profile?.is_premium && (
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                  <Crown className="w-4 h-4 text-accent-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-primary-foreground text-2xl md:text-4xl">
                  {profile?.display_name || "Người dùng"}
                </h1>
                {profile?.is_premium && (
                  <Badge className="bg-accent text-accent-foreground text-xs">
                    <Sparkles className="w-3 h-3 mr-1" /> Premium
                  </Badge>
                )}
              </div>
              <p className="text-primary-foreground/40 text-sm">
                Thành viên từ {profile ? formatDate(profile.created_at) : ""}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border">
        <div className="container mx-auto px-6 md:px-12 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { icon: <Star className="w-5 h-5 text-accent" />, value: profile?.total_points ?? 0, label: "Tổng điểm", bg: "bg-accent/5" },
              { icon: <Heart className="w-5 h-5 text-destructive" />, value: hearts, label: "Tim còn lại", bg: "bg-destructive/5" },
              { icon: <Trophy className="w-5 h-5 text-accent" />, value: completedCount, label: "Đã hoàn thành", bg: "bg-accent/5" },
              { icon: <Award className="w-5 h-5 text-accent" />, value: badges.length, label: "Huy hiệu", bg: "bg-accent/5" },
            ].map((s, i) => (
              <div key={i} className={`flex items-center gap-3 p-4 rounded-xl ${s.bg} border border-border/50`}>
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shadow-sm">
                  {s.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-6 md:px-12 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left: Badges + Progress */}
          <div className="lg:col-span-1 space-y-10">
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" /> Huy hiệu
              </h2>
              {badges.length > 0 ? (
                <div className="space-y-3">
                  {badges.map((b) => (
                    <div key={b.id} className="flex items-center gap-3 p-3 bg-accent/5 border border-accent/10 rounded-xl">
                      <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center text-sm">{b.badge_icon || "🏅"}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{b.badge_name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(b.earned_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-muted/30 rounded-xl border border-border text-center">
                  <Award className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Hoàn thành quiz 8/10 để nhận huy hiệu!</p>
                </div>
              )}
            </motion.section>

            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent" /> Tiến trình
              </h2>
              {progress.length > 0 ? (
                <div className="space-y-1">
                  {progress.map((p) => (
                    <button
                      key={p.milestone_id}
                      onClick={() => navigate(`/milestone/${p.milestone_id}`)}
                      className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {p.is_completed ? <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" /> : <XCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                        <span className="text-sm truncate">{p.milestone_id}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">{p.best_score ?? 0}/10</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-muted/30 rounded-xl border border-border text-center">
                  <Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Bắt đầu làm quiz để ghi nhận tiến trình!</p>
                </div>
              )}
            </motion.section>
          </div>

          {/* Right: Quiz History */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" /> Lịch sử Quiz
            </h2>
            {attempts.length > 0 ? (
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 text-left">
                        <th className="px-4 py-3 font-medium text-muted-foreground">Cột mốc</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Điểm</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Tích lũy</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Tim mất</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Ngày</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {attempts.map((a) => (
                        <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <button onClick={() => navigate(`/milestone/${a.milestone_id}`)} className="text-foreground hover:text-accent transition-colors truncate max-w-[200px] block">
                              {a.milestone_id}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <span className={a.quiz_score >= 8 ? "text-accent font-bold" : "text-foreground"}>{a.quiz_score}/10</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-accent font-medium">+{a.points_earned}</span>
                            {a.double_points_used && <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">x2</Badge>}
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            {a.hearts_lost > 0 ? <span className="text-destructive">-{a.hearts_lost} ❤️</span> : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatDate(a.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/20 rounded-xl border border-border">
                <Trophy className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Chưa có lịch sử quiz nào</p>
                <Button variant="outline" size="sm" onClick={() => navigate("/timeline")}>
                  Khám phá Timeline
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
