import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import UserHeader from "@/components/layout/UserHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Star,
  Heart,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  User,
} from "lucide-react";

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
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchAll = async () => {
      const [profileRes, badgesRes, attemptsRes, progressRes, heartsRes] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("display_name, total_points, is_premium, created_at")
            .eq("user_id", user.id)
            .single(),
          supabase
            .from("badges")
            .select("*")
            .order("earned_at", { ascending: false }),
          supabase
            .from("quiz_attempts")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(20),
          supabase.from("user_progress").select("*"),
          supabase.rpc("get_hearts"),
        ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (badgesRes.data) setBadges(badgesRes.data);
      if (attemptsRes.data) setAttempts(attemptsRes.data);
      if (progressRes.data) setProgress(progressRes.data);
      if (heartsRes.data && heartsRes.data.length > 0)
        setHearts(heartsRes.data[0].hearts_remaining);

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
  const totalAttempts = progress.reduce((s, p) => s + p.attempts_count, 0);
  const avgScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((s, a) => s + a.quiz_score, 0) / attempts.length
        )
      : 0;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-background">
      <UserHeader />

      {/* Hero */}
      <section className="relative py-16 px-6 md:px-12 bg-foreground text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 heritage-pattern opacity-10" />
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
              <User className="w-8 h-8 text-accent" />
            </div>
            <div className="flex-1">
              <h1 className="text-primary-foreground text-2xl md:text-4xl mb-1">
                {profile?.display_name || "Người dùng"}
              </h1>
              <p className="text-primary-foreground/50 text-sm">
                Thành viên từ {profile ? formatDate(profile.created_at) : ""}
                {profile?.is_premium && (
                  <Badge className="ml-2 bg-accent text-accent-foreground text-xs">
                    Premium
                  </Badge>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border">
        <div className="container mx-auto px-6 md:px-12 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              icon={<Star className="w-5 h-5 text-accent" />}
              value={profile?.total_points ?? 0}
              label="Tổng điểm"
            />
            <StatCard
              icon={<Heart className="w-5 h-5 text-destructive" />}
              value={hearts}
              label="Tim còn lại"
            />
            <StatCard
              icon={<Trophy className="w-5 h-5 text-accent" />}
              value={completedCount}
              label="Đã hoàn thành"
            />
            <StatCard
              icon={<Award className="w-5 h-5 text-accent" />}
              value={badges.length}
              label="Huy hiệu"
            />
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 md:px-12 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left: Badges + Progress */}
          <div className="lg:col-span-1 space-y-10">
            {/* Badges */}
            <section>
              <h2 className="text-xl mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" />
                Huy hiệu
              </h2>
              {badges.length > 0 ? (
                <div className="space-y-3">
                  {badges.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-3 p-3 bg-accent/5 border border-accent/10 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm">
                        {b.badge_icon || "🏅"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {b.badge_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(b.earned_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Chưa có huy hiệu nào. Hoàn thành quiz với 8/10 để nhận!
                </p>
              )}
            </section>

            {/* Progress */}
            <section>
              <h2 className="text-xl mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                Tiến trình
              </h2>
              {progress.length > 0 ? (
                <div className="space-y-2">
                  {progress.map((p) => (
                    <button
                      key={p.milestone_id}
                      onClick={() => navigate(`/milestone/${p.milestone_id}`)}
                      className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {p.is_completed ? (
                          <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="text-sm truncate">
                          {p.milestone_id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {p.best_score ?? 0}/10
                        </span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Chưa có tiến trình nào. Bắt đầu làm quiz!
                </p>
              )}
            </section>
          </div>

          {/* Right: Quiz History */}
          <div className="lg:col-span-2">
            <h2 className="text-xl mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Lịch sử Quiz
            </h2>
            {attempts.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 text-left">
                        <th className="px-4 py-3 font-medium text-muted-foreground">
                          Cột mốc
                        </th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">
                          Điểm
                        </th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">
                          Tích lũy
                        </th>
                        <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                          Tim mất
                        </th>
                        <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                          Ngày
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {attempts.map((a) => (
                        <tr
                          key={a.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <button
                              onClick={() =>
                                navigate(`/milestone/${a.milestone_id}`)
                              }
                              className="text-foreground hover:text-accent transition-colors truncate max-w-[200px] block"
                            >
                              {a.milestone_id}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={
                                a.quiz_score >= 8
                                  ? "text-accent font-medium"
                                  : "text-foreground"
                              }
                            >
                              {a.quiz_score}/10
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-accent font-medium">
                              +{a.points_earned}
                            </span>
                            {a.double_points_used && (
                              <Badge
                                variant="outline"
                                className="ml-1 text-[10px] px-1 py-0"
                              >
                                x2
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            {a.hearts_lost > 0 ? (
                              <span className="text-destructive">
                                -{a.hearts_lost} ❤️
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                            {formatDate(a.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-lg border border-border">
                <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  Chưa có lịch sử quiz nào
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/timeline")}
                >
                  Khám phá Timeline
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
      {icon}
    </div>
    <div>
      <div className="font-serif text-2xl text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  </div>
);

export default Profile;
