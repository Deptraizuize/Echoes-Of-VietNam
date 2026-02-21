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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, Search, Trash2, ExternalLink } from "lucide-react";
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
  const [deleteTarget, setDeleteTarget] = useState<MilestoneDetailRow | null>(null);
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

  // Check which milestones don't have details yet
  const milestonesWithoutDetails = useMemo(() => {
    const detailedIds = new Set(details.map(d => d.milestone_id));
    return milestones.filter(m => !detailedIds.has(m.id));
  }, [milestones, details]);

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
    const defaultMilestone = filterMilestone || milestonesWithoutDetails[0]?.id || milestones[0]?.id || "";
    setForm({
      milestone_id: defaultMilestone,
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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("milestone_details").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Đã xóa bài viết." });
      onRefresh();
    }
    setDeleteTarget(null);
  };

  const getMilestoneTitle = (id: string) => milestones.find(m => m.id === id)?.title || id;

  // Content completeness indicator
  const getCompleteness = (d: MilestoneDetailRow) => {
    let filled = 0;
    let total = 4;
    if (d.events) filled++;
    if (d.results) filled++;
    if (d.significance) filled++;
    if (d.summary) filled++;
    return { filled, total };
  };

  return (
    <>
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-xl">Nội dung chi tiết ({details.length})</h3>
          <div className="flex items-center gap-2">
            {milestonesWithoutDetails.length > 0 && (
              <span className="text-xs text-muted-foreground hidden sm:block">
                {milestonesWithoutDetails.length} cột mốc chưa có bài viết
              </span>
            )}
            <Button size="sm" onClick={openNew} className="bg-accent text-accent-foreground">
              <Plus className="w-4 h-4 mr-2" /> Thêm
            </Button>
          </div>
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
              <TableHead className="w-20 text-center">Nội dung</TableHead>
              <TableHead className="w-16 text-center">NV</TableHead>
              <TableHead className="w-16 text-center">DT</TableHead>
              <TableHead className="w-16 text-center">Ảnh</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDetails.map((d) => {
              const { filled, total } = getCompleteness(d);
              return (
                <TableRow key={d.id}>
                  <TableCell>
                    <span className="line-clamp-1 text-xs text-muted-foreground">{getMilestoneTitle(d.milestone_id)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="line-clamp-2 text-sm leading-snug">{d.title}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`text-xs font-medium ${filled === total ? "text-green-500" : filled >= 2 ? "text-accent" : "text-destructive"}`}>
                      {filled}/{total}
                    </span>
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
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(d)} className="h-8 w-8">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(d)} className="h-8 w-8 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredDetails.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {details.length === 0 ? "Chưa có nội dung chi tiết nào" : "Không tìm thấy bài viết phù hợp"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit/Create Dialog — wider for markdown editing */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-3">
              {editing ? "Sửa nội dung chi tiết" : "Thêm nội dung chi tiết"}
              {editing && (
                <a
                  href={`/milestone/${editing.milestone_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline flex items-center gap-1 font-normal"
                >
                  Xem trang <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              rows={8}
              placeholder="## Giai đoạn 1&#10;Nội dung...&#10;&#10;## Giai đoạn 2&#10;Nội dung..."
            />

            <MarkdownEditor
              label="Kết quả"
              value={form.results}
              onChange={(v) => setForm({ ...form, results: v })}
              rows={5}
              placeholder="- Kết quả 1&#10;- Kết quả 2"
            />

            <MarkdownEditor
              label="Ý nghĩa lịch sử"
              value={form.significance}
              onChange={(v) => setForm({ ...form, significance: v })}
              rows={5}
              placeholder="**Ý nghĩa quan trọng**: ..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nhân vật lịch sử (cách nhau bằng dấu phẩy)</Label>
                <Input value={form.hero_names} onChange={(e) => setForm({ ...form, hero_names: e.target.value })} placeholder="Trần Hưng Đạo, Lê Lợi, ..." />
                {form.hero_names && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {form.hero_names.split(",").filter(s => s.trim()).length} nhân vật
                  </p>
                )}
              </div>
              <div>
                <Label>Di tích liên quan (cách nhau bằng dấu phẩy)</Label>
                <Input value={form.landmark_names} onChange={(e) => setForm({ ...form, landmark_names: e.target.value })} placeholder="Bạch Đằng, Đống Đa, ..." />
                {form.landmark_names && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {form.landmark_names.split(",").filter(s => s.trim()).length} di tích
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>URL hình ảnh (mỗi dòng 1 URL)</Label>
              <textarea
                value={form.image_urls}
                onChange={(e) => setForm({ ...form, image_urls: e.target.value })}
                rows={2}
                placeholder="https://example.com/image1.jpg"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              />
              {form.image_urls && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {form.image_urls.split("\n").filter(s => s.trim()).map((url, i) => (
                    <img key={i} src={url.trim()} alt="" className="w-16 h-16 object-cover rounded border border-border" />
                  ))}
                </div>
              )}
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
            <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa bài viết "{deleteTarget?.title}"? Toàn bộ nội dung (diễn biến, kết quả, ý nghĩa) sẽ bị xóa vĩnh viễn.
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

export default MilestoneDetailsTab;
