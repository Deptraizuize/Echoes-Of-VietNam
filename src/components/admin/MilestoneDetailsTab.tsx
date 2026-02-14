import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, Image, Search } from "lucide-react";
import MarkdownEditor from "./MarkdownEditor";

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
  const [filterMilestone, setFilterMilestone] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredDetails = useMemo(() => {
    return details.filter((d) => {
      if (filterMilestone && d.milestone_id !== filterMilestone) return false;
      if (searchQuery && !d.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [details, filterMilestone, searchQuery]);

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
      milestone_id: filterMilestone || milestones[0]?.id || "",
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
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-xl">Nội dung chi tiết ({details.length})</h3>
          <Button size="sm" onClick={openNew} className="bg-accent text-accent-foreground">
            <Plus className="w-4 h-4 mr-2" /> Thêm
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm tiêu đề..."
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
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>

        {filteredDetails.length !== details.length && (
          <p className="text-xs text-muted-foreground">
            Hiển thị {filteredDetails.length}/{details.length} bài viết
          </p>
        )}
      </div>

      <div className="border border-border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px] w-[120px]">Cột mốc</TableHead>
              <TableHead className="min-w-[200px]">Tiêu đề</TableHead>
              <TableHead className="w-16 text-center">NV</TableHead>
              <TableHead className="w-16 text-center">DT</TableHead>
              <TableHead className="w-16 text-center">Ảnh</TableHead>
              <TableHead className="w-14"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDetails.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <span className="line-clamp-1 text-xs text-muted-foreground">{getMilestoneTitle(d.milestone_id)}</span>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-2 text-sm leading-snug">{d.title}</span>
                </TableCell>
                <TableCell className="text-center text-xs text-muted-foreground">{d.hero_names?.length || 0}</TableCell>
                <TableCell className="text-center text-xs text-muted-foreground">{d.landmark_names?.length || 0}</TableCell>
                <TableCell className="text-center">
                  {d.image_urls && d.image_urls.length > 0 ? (
                    <span className="text-xs text-accent font-medium">{d.image_urls.length}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(d)} className="h-8 w-8">
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredDetails.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {details.length === 0 ? "Chưa có nội dung chi tiết nào" : "Không tìm thấy bài viết phù hợp"}
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

            <MarkdownEditor
              label="Tóm tắt"
              value={form.summary}
              onChange={(v) => setForm({ ...form, summary: v })}
              rows={2}
              placeholder="Tóm tắt ngắn gọn..."
            />

            <MarkdownEditor
              label="Diễn biến"
              value={form.events}
              onChange={(v) => setForm({ ...form, events: v })}
              rows={6}
              placeholder="## Giai đoạn 1&#10;Nội dung...&#10;&#10;## Giai đoạn 2&#10;Nội dung..."
            />

            <MarkdownEditor
              label="Kết quả"
              value={form.results}
              onChange={(v) => setForm({ ...form, results: v })}
              rows={4}
              placeholder="- Kết quả 1&#10;- Kết quả 2"
            />

            <MarkdownEditor
              label="Ý nghĩa lịch sử"
              value={form.significance}
              onChange={(v) => setForm({ ...form, significance: v })}
              rows={4}
              placeholder="**Ý nghĩa quan trọng**: ..."
            />

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
              <textarea
                value={form.image_urls}
                onChange={(e) => setForm({ ...form, image_urls: e.target.value })}
                rows={2}
                placeholder="https://example.com/image1.jpg"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
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
