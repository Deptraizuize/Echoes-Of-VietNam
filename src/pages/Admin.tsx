import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen, HelpCircle, Users, BarChart3, ArrowLeft, Crown, MessageSquare, Shield,
} from "lucide-react";
import logo from "@/assets/logo.png";
import PremiumRequestsTab from "@/components/admin/PremiumRequestsTab";
import FeedbackTab from "@/components/admin/FeedbackTab";
import BannersTab from "@/components/admin/BannersTab";
import RewardsTab from "@/components/admin/RewardsTab";
import QuestionsTab from "@/components/admin/QuestionsTab";
import MilestoneDetailsTab from "@/components/admin/MilestoneDetailsTab";
import MilestonesTab from "@/components/admin/MilestonesTab";
import PaymentSettingsTab from "@/components/admin/PaymentSettingsTab";
import AdminSidebar from "@/components/admin/AdminSidebar";
import LeaderboardTab from "@/components/admin/LeaderboardTab";

interface MilestoneRow { id: string; title: string; period_id: string; period_title: string; phase_id: string; phase_title: string; sort_order: number; year: string | null; }
interface QuestionRow { id: string; milestone_id: string; question: string; options: string[]; correct_answer: number; image_url: string | null; }
interface ProfileRow { id: string; user_id: string; display_name: string | null; is_premium: boolean; premium_expires_at: string | null; total_points: number; created_at: string; }

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeSection, setActiveSection] = useState("premium");
  const [milestones, setMilestones] = useState<MilestoneRow[]>([]);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [premiumRequests, setPremiumRequests] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [rewardsList, setRewardsList] = useState<any[]>([]);
  const [redemptionsList, setRedemptionsList] = useState<any[]>([]);
  const [milestoneDetails, setMilestoneDetails] = useState<any[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<any[]>([]);
  const [adminUserIds, setAdminUserIds] = useState<string[]>([]);
  const [stats, setStats] = useState({ users: 0, milestones: 0, questions: 0, attempts: 0, pendingUpgrades: 0, newFeedback: 0 });

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    const checkAdmin = async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const admin = data?.some((r) => r.role === "admin") ?? false;
      setIsAdmin(admin);
      if (!admin) navigate("/timeline");
    };
    checkAdmin();
  }, [user, navigate]);

  useEffect(() => { if (isAdmin) fetchAll(); }, [isAdmin]);

  const fetchAll = async () => {
    const [m, q, p, pr, fb, bn, rw, rd, md, ps, roles] = await Promise.all([
      supabase.from("milestones").select("id, title, period_id, period_title, phase_id, phase_title, sort_order, year").order("sort_order"),
      supabase.from("quiz_questions").select("id, milestone_id, question, options, correct_answer, image_url").order("created_at"),
      supabase.from("profiles").select("id, user_id, display_name, is_premium, premium_expires_at, total_points, created_at").order("created_at", { ascending: false }),
      supabase.from("premium_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("feedback").select("*").order("created_at", { ascending: false }),
      supabase.from("ad_banners").select("*").order("display_order"),
      supabase.from("rewards").select("*").order("points_cost"),
      supabase.from("reward_redemptions").select("*").order("created_at", { ascending: false }),
      supabase.from("milestone_details").select("*").order("created_at"),
      supabase.from("payment_settings").select("*").order("created_at"),
      supabase.from("user_roles").select("user_id, role").eq("role", "admin"),
    ]);
    if (m.data) setMilestones(m.data);
    if (q.data) setQuestions(q.data.map((qq) => ({ ...qq, options: qq.options as unknown as string[], image_url: qq.image_url })));
    if (p.data) setProfiles(p.data);
    if (pr.data) setPremiumRequests(pr.data);
    if (fb.data) setFeedbackList(fb.data);
    if (bn.data) setBanners(bn.data);
    if (rw.data) setRewardsList(rw.data);
    if (rd.data) setRedemptionsList(rd.data);
    if (md.data) setMilestoneDetails(md.data);
    if (ps.data) setPaymentSettings(ps.data);
    setAdminUserIds(roles.data?.map((r: any) => r.user_id) ?? []);
    setStats({
      users: p.data?.length ?? 0, milestones: m.data?.length ?? 0, questions: q.data?.length ?? 0,
      attempts: 0, pendingUpgrades: pr.data?.filter((r: any) => r.status === "pending").length ?? 0,
      newFeedback: fb.data?.filter((f: any) => f.status === "new").length ?? 0,
    });
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "premium": return <PremiumRequestsTab requests={premiumRequests} onRefresh={fetchAll} />;
      case "feedback": return <FeedbackTab feedback={feedbackList} onRefresh={fetchAll} />;
      case "questions": return <QuestionsTab milestones={milestones} questions={questions} onRefresh={fetchAll} />;
      case "milestone-details": return <MilestoneDetailsTab milestones={milestones} details={milestoneDetails} onRefresh={fetchAll} />;
      case "milestones": return <MilestonesTab milestones={milestones} onRefresh={fetchAll} />;
      case "banners": return <BannersTab banners={banners} onRefresh={fetchAll} />;
      case "rewards": return <RewardsTab rewards={rewardsList} redemptions={redemptionsList} onRefresh={fetchAll} />;
      case "users": return <UsersSection profiles={profiles} adminUserIds={adminUserIds} onRefresh={fetchAll} />;
      case "leaderboard": return <LeaderboardTab profiles={profiles} adminUserIds={adminUserIds} />;
      case "payment": return <PaymentSettingsTab settings={paymentSettings} onRefresh={fetchAll} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-foreground text-primary-foreground border-b border-border h-[52px]">
        <div className="px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-7 h-7 rounded-lg object-contain" />
            <span className="font-serif text-lg">Admin</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-primary-foreground/60">
            <span>{stats.users} người dùng</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{stats.milestones} cột mốc</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{stats.questions} câu hỏi</span>
            <Button variant="ghost" size="sm" onClick={() => navigate("/timeline")} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 ml-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Thoát
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <AdminSidebar active={activeSection} onSelect={setActiveSection} stats={stats} />
        <main className="flex-1 min-w-0 p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

/* Inline sub-sections */

const UsersSection = ({ profiles, adminUserIds, onRefresh }: { profiles: ProfileRow[]; adminUserIds: string[]; onRefresh: () => void }) => {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (userId: string) => {
    setDeleting(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ target_user_id: userId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Lỗi xóa tài khoản");
      toast({ title: "Đã xóa tài khoản thành công" });
      setConfirmId(null);
      onRefresh();
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <h3 className="font-serif text-xl mb-4">Người dùng ({profiles.length})</h3>
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Tên</TableHead><TableHead>Vai trò</TableHead><TableHead>Premium</TableHead><TableHead>Hết hạn</TableHead><TableHead>Điểm</TableHead><TableHead>Ngày tham gia</TableHead><TableHead className="text-right">Hành động</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {profiles.map((p) => {
              const isAdmin = adminUserIds.includes(p.user_id);
              return (
                <TableRow key={p.id}>
                  <TableCell>{p.display_name || "—"}</TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-accent/15 text-accent px-2 py-0.5 rounded-full">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Người dùng</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {p.is_premium ? <span className="text-accent font-medium">Premium ⭐</span> : <span className="text-muted-foreground">Free</span>}
                  </TableCell>
                  <TableCell className="text-xs">
                    {p.premium_expires_at ? (
                      <div>
                        <span className="text-foreground">{new Date(p.premium_expires_at).toLocaleDateString("vi-VN")}</span>
                        {(() => {
                          const days = Math.ceil((new Date(p.premium_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                          return days > 0
                            ? <span className="block text-accent text-[11px]">Còn {days} ngày</span>
                            : <span className="block text-destructive text-[11px]">Đã hết hạn</span>;
                        })()}
                      </div>
                    ) : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>{p.total_points}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell className="text-right">
                    {isAdmin ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : confirmId === p.user_id ? (
                      <div className="flex items-center gap-1 justify-end">
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(p.user_id)} disabled={deleting === p.user_id} className="text-xs h-7 px-2">
                          {deleting === p.user_id ? "Đang xóa..." : "Xác nhận"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)} className="text-xs h-7 px-2">Hủy</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setConfirmId(p.user_id)} className="text-xs h-7 px-2 text-destructive hover:text-destructive">
                        Xóa
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

interface ProfileRow { id: string; user_id: string; display_name: string | null; is_premium: boolean; premium_expires_at: string | null; total_points: number; created_at: string; }

export default Admin;
