import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Users,
  BarChart3,
  Plus,
  ArrowLeft,
  Trash2,
  Edit,
  Crown,
  MessageSquare,
} from "lucide-react";
import logo from "@/assets/logo.png";
import PremiumRequestsTab from "@/components/admin/PremiumRequestsTab";
import FeedbackTab from "@/components/admin/FeedbackTab";

interface MilestoneRow {
  id: string;
  title: string;
  period_title: string;
  phase_title: string;
}

interface QuestionRow {
  id: string;
  milestone_id: string;
  question: string;
  options: string[];
  correct_answer: number;
}

interface ProfileRow {
  id: string;
  user_id: string;
  display_name: string | null;
  is_premium: boolean;
  total_points: number;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [milestones, setMilestones] = useState<MilestoneRow[]>([]);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [premiumRequests, setPremiumRequests] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, milestones: 0, questions: 0, attempts: 0, pendingUpgrades: 0, newFeedback: 0 });

  // Dialog state
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionRow | null>(null);
  const [questionForm, setQuestionForm] = useState({
    milestone_id: "",
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const checkAdmin = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const admin = data?.some((r) => r.role === "admin") ?? false;
      setIsAdmin(admin);
      if (!admin) navigate("/timeline");
    };

    checkAdmin();
  }, [user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAll();
  }, [isAdmin]);

  const fetchAll = async () => {
    const [m, q, p, pr, fb] = await Promise.all([
      supabase.from("milestones").select("id, title, period_title, phase_title").order("sort_order"),
      supabase.from("quiz_questions").select("id, milestone_id, question, options, correct_answer").order("created_at"),
      supabase.from("profiles").select("id, user_id, display_name, is_premium, total_points, created_at").order("created_at", { ascending: false }),
      supabase.from("premium_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("feedback").select("*").order("created_at", { ascending: false }),
    ]);

    if (m.data) setMilestones(m.data);
    if (q.data) setQuestions(q.data.map((qq) => ({ ...qq, options: qq.options as unknown as string[] })));
    if (p.data) setProfiles(p.data);
    if (pr.data) setPremiumRequests(pr.data);
    if (fb.data) setFeedbackList(fb.data);

    setStats({
      users: p.data?.length ?? 0,
      milestones: m.data?.length ?? 0,
      questions: q.data?.length ?? 0,
      attempts: 0,
      pendingUpgrades: pr.data?.filter((r: any) => r.status === "pending").length ?? 0,
      newFeedback: fb.data?.filter((f: any) => f.status === "new").length ?? 0,
    });
  };

  const openNewQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      milestone_id: milestones[0]?.id ?? "",
      question: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: 0,
    });
    setShowQuestionDialog(true);
  };

  const saveQuestion = async () => {
    const options = [
      questionForm.option_a,
      questionForm.option_b,
      questionForm.option_c,
      questionForm.option_d,
    ].filter(Boolean);

    if (options.length < 2 || !questionForm.question || !questionForm.milestone_id) {
      toast({ title: "Lỗi", description: "Cần ít nhất câu hỏi và 2 đáp án", variant: "destructive" });
      return;
    }

    const payload = {
      milestone_id: questionForm.milestone_id,
      question: questionForm.question,
      options: JSON.stringify(options),
      correct_answer: questionForm.correct_answer,
    };

    if (editingQuestion) {
      const { error } = await supabase
        .from("quiz_questions")
        .update(payload)
        .eq("id", editingQuestion.id);
      if (error) {
        toast({ title: "Lỗi", description: error.message, variant: "destructive" });
        return;
      }
    } else {
      const { error } = await supabase.from("quiz_questions").insert(payload);
      if (error) {
        toast({ title: "Lỗi", description: error.message, variant: "destructive" });
        return;
      }
    }

    toast({ title: "Thành công!", description: "Câu hỏi đã được lưu." });
    setShowQuestionDialog(false);
    fetchAll();
  };

  const deleteQuestion = async (id: string) => {
    const { error } = await supabase.from("quiz_questions").delete().eq("id", id);
    if (!error) fetchAll();
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-foreground text-primary-foreground border-b border-border">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
            <span className="font-serif text-lg">Admin Dashboard</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/timeline")}
            className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Về trang chính
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { icon: Users, label: "Người dùng", value: stats.users, color: "text-accent" },
            { icon: BookOpen, label: "Cột mốc", value: stats.milestones, color: "text-accent" },
            { icon: HelpCircle, label: "Câu hỏi", value: stats.questions, color: "text-accent" },
            { icon: BarChart3, label: "Lượt quiz", value: stats.attempts, color: "text-accent" },
            { icon: Crown, label: "Chờ duyệt", value: stats.pendingUpgrades, color: "text-accent" },
            { icon: MessageSquare, label: "Góp ý mới", value: stats.newFeedback, color: "text-accent" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-lg p-6">
              <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
              <div className="font-serif text-3xl text-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="premium">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="premium">
              <Crown className="w-4 h-4 mr-2" /> Nâng cấp {stats.pendingUpgrades > 0 && `(${stats.pendingUpgrades})`}
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <MessageSquare className="w-4 h-4 mr-2" /> Góp ý {stats.newFeedback > 0 && `(${stats.newFeedback})`}
            </TabsTrigger>
            <TabsTrigger value="questions">
              <HelpCircle className="w-4 h-4 mr-2" /> Câu hỏi
            </TabsTrigger>
            <TabsTrigger value="milestones">
              <BookOpen className="w-4 h-4 mr-2" /> Cột mốc
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" /> Người dùng
            </TabsTrigger>
          </TabsList>

          {/* Premium Requests Tab */}
          <TabsContent value="premium">
            <PremiumRequestsTab requests={premiumRequests} onRefresh={fetchAll} />
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <FeedbackTab feedback={feedbackList} onRefresh={fetchAll} />
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-xl">Ngân hàng câu hỏi ({questions.length})</h3>
              <Button size="sm" onClick={openNewQuestion} className="bg-accent text-accent-foreground">
                <Plus className="w-4 h-4 mr-2" /> Thêm câu hỏi
              </Button>
            </div>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Câu hỏi</TableHead>
                    <TableHead className="w-40">Cột mốc</TableHead>
                    <TableHead className="w-20">Đáp án</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.slice(0, 50).map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="max-w-xs truncate">{q.question}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{q.milestone_id}</TableCell>
                      <TableCell>{q.options[q.correct_answer]?.slice(0, 15)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteQuestion(q.id)}
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones">
            <h3 className="font-serif text-xl mb-4">Danh sách cột mốc ({milestones.length})</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Thời kỳ</TableHead>
                    <TableHead>Giai đoạn</TableHead>
                  </TableRow>
                </TableHeader>
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
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <h3 className="font-serif text-xl mb-4">Người dùng ({profiles.length})</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Điểm</TableHead>
                    <TableHead>Ngày tham gia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.display_name || "—"}</TableCell>
                      <TableCell>
                        {p.is_premium ? (
                          <span className="text-accent font-medium">Premium ⭐</span>
                        ) : (
                          <span className="text-muted-foreground">Free</span>
                        )}
                      </TableCell>
                      <TableCell>{p.total_points}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString("vi-VN")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Question Dialog */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editingQuestion ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Cột mốc</Label>
              <select
                value={questionForm.milestone_id}
                onChange={(e) => setQuestionForm({ ...questionForm, milestone_id: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Câu hỏi</Label>
              <Textarea
                value={questionForm.question}
                onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                placeholder="Nhập câu hỏi..."
              />
            </div>

            {["A", "B", "C", "D"].map((letter, i) => (
              <div key={letter}>
                <Label>Đáp án {letter}</Label>
                <Input
                  value={
                    i === 0
                      ? questionForm.option_a
                      : i === 1
                      ? questionForm.option_b
                      : i === 2
                      ? questionForm.option_c
                      : questionForm.option_d
                  }
                  onChange={(e) => {
                    const key = `option_${letter.toLowerCase()}` as keyof typeof questionForm;
                    setQuestionForm({ ...questionForm, [key]: e.target.value });
                  }}
                  placeholder={`Đáp án ${letter}`}
                />
              </div>
            ))}

            <div>
              <Label>Đáp án đúng</Label>
              <select
                value={questionForm.correct_answer}
                onChange={(e) =>
                  setQuestionForm({ ...questionForm, correct_answer: parseInt(e.target.value) })
                }
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value={0}>A</option>
                <option value={1}>B</option>
                <option value={2}>C</option>
                <option value={3}>D</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
              Hủy
            </Button>
            <Button onClick={saveQuestion} className="bg-accent text-accent-foreground">
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
