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
  BookOpen, HelpCircle, Users, BarChart3, ArrowLeft, Crown, MessageSquare,
} from "lucide-react";
import logo from "@/assets/logo.png";
import PremiumRequestsTab from "@/components/admin/PremiumRequestsTab";
import FeedbackTab from "@/components/admin/FeedbackTab";
import BannersTab from "@/components/admin/BannersTab";
import RewardsTab from "@/components/admin/RewardsTab";
import QuestionsTab from "@/components/admin/QuestionsTab";
import MilestoneDetailsTab from "@/components/admin/MilestoneDetailsTab";
import PaymentSettingsTab from "@/components/admin/PaymentSettingsTab";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface MilestoneRow { id: string; title: string; period_title: string; phase_title: string; }
interface QuestionRow { id: string; milestone_id: string; question: string; options: string[]; correct_answer: number; image_url: string | null; }
interface ProfileRow { id: string; user_id: string; display_name: string | null; is_premium: boolean; total_points: number; created_at: string; }

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
    const [m, q, p, pr, fb, bn, rw, rd, md, ps] = await Promise.all([
      supabase.from("milestones").select("id, title, period_title, phase_title").order("sort_order"),
      supabase.from("quiz_questions").select("id, milestone_id, question, options, correct_answer, image_url").order("created_at"),
      supabase.from("profiles").select("id, user_id, display_name, is_premium, total_points, created_at").order("created_at", { ascending: false }),
      supabase.from("premium_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("feedback").select("*").order("created_at", { ascending: false }),
      supabase.from("ad_banners").select("*").order("display_order"),
      supabase.from("rewards").select("*").order("points_cost"),
      supabase.from("reward_redemptions").select("*").order("created_at", { ascending: false }),
      supabase.from("milestone_details").select("*").order("created_at"),
      supabase.from("payment_settings").select("*").order("created_at"),
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
      case "milestones": return <MilestonesSection milestones={milestones} />;
      case "banners": return <BannersTab banners={banners} onRefresh={fetchAll} />;
      case "rewards": return <RewardsTab rewards={rewardsList} redemptions={redemptionsList} onRefresh={fetchAll} />;
      case "users": return <UsersSection profiles={profiles} />;
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

/* Inline sub-sections that were previously simple tab contents */
const MilestonesSection = ({ milestones }: { milestones: MilestoneRow[] }) => (
  <div>
    <h3 className="font-serif text-xl mb-4">Danh sách cột mốc ({milestones.length})</h3>
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader><TableRow>
          <TableHead>ID</TableHead><TableHead>Tiêu đề</TableHead><TableHead>Thời kỳ</TableHead><TableHead>Giai đoạn</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {milestones.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-mono text-sm">{m.id}</TableCell>
              <TableCell>{m.title}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{m.period_title}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{m.phase_title}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

interface MilestoneRow { id: string; title: string; period_title: string; phase_title: string; }

const UsersSection = ({ profiles }: { profiles: ProfileRow[] }) => (
  <div>
    <h3 className="font-serif text-xl mb-4">Người dùng ({profiles.length})</h3>
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader><TableRow>
          <TableHead>Tên</TableHead><TableHead>Premium</TableHead><TableHead>Điểm</TableHead><TableHead>Ngày tham gia</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {profiles.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.display_name || "—"}</TableCell>
              <TableCell>
                {p.is_premium ? <span className="text-accent font-medium">Premium ⭐</span> : <span className="text-muted-foreground">Free</span>}
              </TableCell>
              <TableCell>{p.total_points}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString("vi-VN")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

interface ProfileRow { id: string; user_id: string; display_name: string | null; is_premium: boolean; total_points: number; created_at: string; }

export default Admin;
