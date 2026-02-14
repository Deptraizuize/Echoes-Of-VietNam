import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, Image } from "lucide-react";

interface MilestoneRow {
  id: string;
  title: string;
  period_title: string;
  phase_title: string;
}

interface MilestoneDetailRow {
  id: string;
  milestone_id: string;
  title: string;
  summary: string | null;
  events: string | null;
  results: string | null;
  significance: string | null;
  hero_names: string[] | null;
  landmark_names: string[] | null;
  image_urls: string[] | null;
}

interface Props {
  milestones: MilestoneRow[];
  details: MilestoneDetailRow[];
  onRefresh: () => void;
}

const MilestoneDetailsTab = ({ milestones, details, onRefresh }: Props) => {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<MilestoneDetailRow | null>(null);
  const [form, setForm] = useState({
    milestone_id: "",
    title: "",
    summary: "",
    events: "",
    results: "",
    significance: "",
    hero_names: "",
    landmark_names: "",
    image_urls: "",
  });

  const openEdit = (d: MilestoneDetailRow) => {
    setEditing(d);
    setForm({
      milestone_id: d.milestone_id,
      title: d.title,
      summary: d.summary || "",
      events: d.events || "",
      results: d.results || "",
      significance: d.significance || "",
      hero_names: d.hero_names?.join(", ") || "",
      landmark_names: d.landmark_names?.join(", ") || "",
      image_urls: d.image_urls?.join("\n") || "",
    });
    setShowDialog(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({
      milestone_id: milestones[0]?.id || "",
      title: "",
      summary: "",
      events: "",
      results: "",
      significance: "",
      hero_names: "",
      landmark_names: "",
      image_urls: "",
    });
    setShowDialog(true);
  };

  const save = async () => {
    if (!form.milestone_id || !form.title) {
      toast({ title: "Lỗi", description: "Cần chọn cột mốc và nhập tiêu đề", variant: "destructive" });
      return;
    }

    const payload = {
      milestone_id: form.milestone_id,
      title: form.title,
      summary: form.summary || null,
      events: form.events || null,
      results: form.results || null,
      significance: form.significance || null,
      hero_names: form.hero_names ? form.hero_names.split(",").map(s => s.trim()).filter(Boolean) : null,
      landmark_names: form.landmark_names ? form.landmark_names.split(",").map(s => s.trim()).filter(Boolean) : null,
      image_urls: form.image_urls ? form.image_urls.split("\n").map(s => s.trim()).filter(Boolean) : null,
    };

    if (editing) {
      const { error } = await supabase.from("milestone_details").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("milestone_details").insert(payload);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); return; }
    }

    toast({ title: "Thành công!", description: "Nội dung đã được lưu." });
    setShowDialog(false);
    onRefresh();
  };

  const getMilestoneTitle = (id: string) => milestones.find(m => m.id === id)?.title || id;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-serif text-xl">Nội dung chi tiết ({details.length})</h3>
        <Button size="sm" onClick={openNew} className="bg-accent text-accent-foreground">
          <Plus className="w-4 h-4 mr-2" /> Thêm nội dung
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cột mốc</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead className="w-20">Nhân vật</TableHead>
              <TableHead className="w-20">Di tích</TableHead>
              <TableHead className="w-20">Hình</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="text-sm">{getMilestoneTitle(d.milestone_id)}</TableCell>
                <TableCell className="max-w-xs truncate">{d.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{d.hero_names?.length || 0}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{d.landmark_names?.length || 0}</TableCell>
                <TableCell>
                  {d.image_urls && d.image_urls.length > 0 && <Image className="w-4 h-4 text-accent" />}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(d)} className="h-8 w-8">
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {details.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Chưa có nội dung chi tiết nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editing ? "Sửa nội dung chi tiết" : "Thêm nội dung chi tiết"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Cột mốc</Label>
              <select
                value={form.milestone_id}
                onChange={(e) => setForm({ ...form, milestone_id: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                disabled={!!editing}
              >
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Tiêu đề</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            <div>
              <Label>Tóm tắt</Label>
              <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} />
            </div>

            <div>
              <Label>Diễn biến</Label>
              <Textarea value={form.events} onChange={(e) => setForm({ ...form, events: e.target.value })} rows={4} />
            </div>

            <div>
              <Label>Kết quả</Label>
              <Textarea value={form.results} onChange={(e) => setForm({ ...form, results: e.target.value })} rows={3} />
            </div>

            <div>
              <Label>Ý nghĩa lịch sử</Label>
              <Textarea value={form.significance} onChange={(e) => setForm({ ...form, significance: e.target.value })} rows={3} />
            </div>

            <div>
              <Label>Nhân vật lịch sử (cách nhau bằng dấu phẩy)</Label>
              <Input value={form.hero_names} onChange={(e) => setForm({ ...form, hero_names: e.target.value })} placeholder="Trần Hưng Đạo, Lê Lợi, ..." />
            </div>

            <div>
              <Label>Di tích liên quan (cách nhau bằng dấu phẩy)</Label>
              <Input value={form.landmark_names} onChange={(e) => setForm({ ...form, landmark_names: e.target.value })} placeholder="Bạch Đằng, Đống Đa, ..." />
            </div>

            <div>
              <Label>URL hình ảnh (mỗi dòng 1 URL)</Label>
              <Textarea value={form.image_urls} onChange={(e) => setForm({ ...form, image_urls: e.target.value })} rows={2} placeholder="https://example.com/image1.jpg" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Hủy</Button>
            <Button onClick={save} className="bg-accent text-accent-foreground">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MilestoneDetailsTab;
