import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Search } from "lucide-react";

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
  image_url: string | null;
}

interface Props {
  milestones: MilestoneRow[];
  questions: QuestionRow[];
  onRefresh: () => void;
}

const QuestionsTab = ({ milestones, questions, onRefresh }: Props) => {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<QuestionRow | null>(null);
  const [filterMilestone, setFilterMilestone] = useState("");
  const [filterHasImage, setFilterHasImage] = useState<"all" | "yes" | "no">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<QuestionRow | null>(null);
  const [form, setForm] = useState({
    milestone_id: "",
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: 0,
    image_url: "",
  });

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (filterMilestone && q.milestone_id !== filterMilestone) return false;
      if (filterHasImage === "yes" && !q.image_url) return false;
      if (filterHasImage === "no" && q.image_url) return false;
      if (searchQuery && !q.question.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [questions, filterMilestone, filterHasImage, searchQuery]);

  // Group questions by milestone for stats
  const milestoneStats = useMemo(() => {
    const map: Record<string, number> = {};
    questions.forEach((q) => { map[q.milestone_id] = (map[q.milestone_id] || 0) + 1; });
    return map;
  }, [questions]);

  const openNew = () => {
    setEditing(null);
    setForm({
      milestone_id: filterMilestone || (milestones[0]?.id ?? ""),
      question: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: 0,
      image_url: "",
    });
    setShowDialog(true);
  };

  const openEdit = (q: QuestionRow) => {
    setEditing(q);
    setForm({
      milestone_id: q.milestone_id,
      question: q.question,
      option_a: q.options[0] || "",
      option_b: q.options[1] || "",
      option_c: q.options[2] || "",
      option_d: q.options[3] || "",
      correct_answer: q.correct_answer,
      image_url: q.image_url || "",
    });
    setShowDialog(true);
  };

  const save = async () => {
    const options = [form.option_a, form.option_b, form.option_c, form.option_d].filter(Boolean);
    if (options.length < 2 || !form.question || !form.milestone_id) {
      toast({ title: "Lỗi", description: "Cần ít nhất câu hỏi và 2 đáp án", variant: "destructive" });
      return;
    }

    if (form.correct_answer >= options.length) {
      toast({ title: "Lỗi", description: "Đáp án đúng không hợp lệ", variant: "destructive" });
      return;
    }

    const payload = {
      milestone_id: form.milestone_id,
      question: form.question,
      options: options, // FIX: Send array directly, not JSON.stringify
      correct_answer: form.correct_answer,
      image_url: form.image_url || null,
    };

    if (editing) {
      const { error } = await supabase.from("quiz_questions").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("quiz_questions").insert(payload);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); return; }
    }

    toast({ title: "Thành công!", description: "Câu hỏi đã được lưu." });
    setShowDialog(false);
    onRefresh();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("quiz_questions").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Đã xóa câu hỏi." });
      onRefresh();
    }
    setDeleteTarget(null);
  };

  const getMilestoneTitle = (id: string) => milestones.find(m => m.id === id)?.title || id;

  return (
    <>
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-xl">Ngân hàng câu hỏi ({questions.length})</h3>
          <Button size="sm" onClick={openNew} className="bg-accent text-accent-foreground">
            <Plus className="w-4 h-4 mr-2" /> Thêm
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm câu hỏi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
          <select
            value={filterMilestone}
            onChange={(e) => setFilterMilestone(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[150px]"
          >
            <option value="">Tất cả cột mốc</option>
            {milestones.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} ({milestoneStats[m.id] || 0})
              </option>
            ))}
          </select>
          <select
            value={filterHasImage}
            onChange={(e) => setFilterHasImage(e.target.value as "all" | "yes" | "no")}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">Tất cả</option>
            <option value="yes">Có ảnh</option>
            <option value="no">Không ảnh</option>
          </select>
        </div>

        {filteredQuestions.length !== questions.length && (
          <p className="text-xs text-muted-foreground">
            Hiển thị {filteredQuestions.length}/{questions.length} câu hỏi
          </p>
        )}
      </div>

      <div className="border border-border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[250px]">Câu hỏi</TableHead>
              <TableHead className="min-w-[120px] w-[120px]">Cột mốc</TableHead>
              <TableHead className="w-16 text-center">Ảnh</TableHead>
              <TableHead className="min-w-[100px] w-[100px]">Đáp án đúng</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.slice(0, 50).map((q) => (
              <TableRow key={q.id}>
                <TableCell>
                  <span className="line-clamp-2 text-sm leading-snug">{q.question}</span>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1 text-xs text-muted-foreground">{getMilestoneTitle(q.milestone_id)}</span>
                </TableCell>
                <TableCell className="text-center">
                  {q.image_url ? (
                    <img src={q.image_url} alt="" className="w-8 h-8 rounded object-cover mx-auto" />
                  ) : (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1 text-xs font-medium text-accent">
                    {String.fromCharCode(65 + q.correct_answer)}. {q.options[q.correct_answer]?.slice(0, 20)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(q)} className="h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(q)} className="h-8 w-8 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredQuestions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {questions.length === 0 ? "Chưa có câu hỏi nào" : "Không tìm thấy câu hỏi phù hợp"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filteredQuestions.length > 50 && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Hiển thị 50/{filteredQuestions.length} câu hỏi. Sử dụng bộ lọc để thu hẹp kết quả.
        </p>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editing ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Cột mốc</Label>
              <select
                value={form.milestone_id}
                onChange={(e) => setForm({ ...form, milestone_id: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Câu hỏi</Label>
              <Textarea
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="Nhập câu hỏi..."
              />
            </div>

            <div>
              <Label>URL hình ảnh (tùy chọn)</Label>
              <Input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg border border-border" />
              )}
            </div>

            {["A", "B", "C", "D"].map((letter, i) => (
              <div key={letter} className="flex items-center gap-2">
                <div className="flex-1">
                  <Label className="flex items-center gap-2">
                    Đáp án {letter}
                    {form.correct_answer === i && (
                      <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded">✓ Đúng</span>
                    )}
                  </Label>
                  <Input
                    value={
                      i === 0 ? form.option_a : i === 1 ? form.option_b : i === 2 ? form.option_c : form.option_d
                    }
                    onChange={(e) => {
                      const key = `option_${letter.toLowerCase()}` as keyof typeof form;
                      setForm({ ...form, [key]: e.target.value });
                    }}
                    placeholder={`Đáp án ${letter}`}
                    className={form.correct_answer === i ? "border-accent/50 bg-accent/5" : ""}
                  />
                </div>
              </div>
            ))}

            <div>
              <Label>Đáp án đúng</Label>
              <select
                value={form.correct_answer}
                onChange={(e) => setForm({ ...form, correct_answer: parseInt(e.target.value) })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value={0}>A{form.option_a ? ` — ${form.option_a.slice(0, 40)}` : ""}</option>
                <option value={1}>B{form.option_b ? ` — ${form.option_b.slice(0, 40)}` : ""}</option>
                <option value={2}>C{form.option_c ? ` — ${form.option_c.slice(0, 40)}` : ""}</option>
                <option value={3}>D{form.option_d ? ` — ${form.option_d.slice(0, 40)}` : ""}</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Hủy</Button>
            <Button onClick={save} className="bg-accent text-accent-foreground">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa câu hỏi?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <span className="block mt-2 text-sm">
                  "{deleteTarget.question.slice(0, 100)}{deleteTarget.question.length > 100 ? "..." : ""}"
                </span>
              )}
              <span className="block mt-2">Hành động này không thể hoàn tác.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default QuestionsTab;
