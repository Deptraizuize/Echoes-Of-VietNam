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
import { Edit, Plus, Trash2, Search, GripVertical } from "lucide-react";
import { timelineData } from "@/data/timelineData";

interface MilestoneRow {
  id: string;
  title: string;
  period_id: string;
  period_title: string;
  phase_id: string;
  phase_title: string;
  sort_order: number;
}

interface Props {
  milestones: MilestoneRow[];
  onRefresh: () => void;
}

const MilestonesTab = ({ milestones, onRefresh }: Props) => {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<MilestoneRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MilestoneRow | null>(null);
  const [filterPeriod, setFilterPeriod] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({
    id: "",
    title: "",
    period_id: "",
    period_title: "",
    phase_id: "",
    phase_title: "",
    sort_order: 0,
  });

  const filteredMilestones = useMemo(() => {
    return milestones.filter((m) => {
      if (filterPeriod && m.period_id !== filterPeriod) return false;
      if (searchQuery && !m.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [milestones, filterPeriod, searchQuery]);

  // Get unique periods from timeline data
  const periods = timelineData.map(p => ({ id: p.id, title: p.title }));

  // Get phases for selected period
  const getPhases = (periodId: string) => {
    const period = timelineData.find(p => p.id === periodId);
    return period?.phases || [];
  };

  const openEdit = (m: MilestoneRow) => {
    setEditing(m);
    setForm({
      id: m.id,
      title: m.title,
      period_id: m.period_id,
      period_title: m.period_title,
      phase_id: m.phase_id,
      phase_title: m.phase_title,
      sort_order: m.sort_order,
    });
    setShowDialog(true);
  };

  const openNew = () => {
    setEditing(null);
    const maxSort = milestones.length > 0 ? Math.max(...milestones.map(m => m.sort_order)) + 1 : 0;
    const defaultPeriod = timelineData[0];
    const defaultPhase = defaultPeriod?.phases[0];
    setForm({
      id: "",
      title: "",
      period_id: defaultPeriod?.id || "",
      period_title: defaultPeriod?.title || "",
      phase_id: defaultPhase?.id || "",
      phase_title: defaultPhase?.name || "",
      sort_order: maxSort,
    });
    setShowDialog(true);
  };

  const handlePeriodChange = (periodId: string) => {
    const period = timelineData.find(p => p.id === periodId);
    const firstPhase = period?.phases[0];
    setForm({
      ...form,
      period_id: periodId,
      period_title: period?.title || "",
      phase_id: firstPhase?.id || "",
      phase_title: firstPhase?.name || "",
    });
  };

  const handlePhaseChange = (phaseId: string) => {
    const period = timelineData.find(p => p.id === form.period_id);
    const phase = period?.phases.find(ph => ph.id === phaseId);
    setForm({ ...form, phase_id: phaseId, phase_title: phase?.name || "" });
  };

  const generateId = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 40);
  };

  const save = async () => {
    if (!form.title || !form.period_id || !form.phase_id) {
      toast({ title: "Lỗi", description: "Cần nhập đầy đủ tiêu đề, thời kỳ và giai đoạn", variant: "destructive" });
      return;
    }

    const id = editing ? form.id : (form.id || generateId(form.title));

    const payload = {
      id,
      title: form.title,
      period_id: form.period_id,
      period_title: form.period_title,
      phase_id: form.phase_id,
      phase_title: form.phase_title,
      sort_order: form.sort_order,
    };

    if (editing) {
      const { error } = await supabase.from("milestones").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("milestones").insert(payload);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); return; }
    }

    toast({ title: "Thành công!", description: editing ? "Cột mốc đã được cập nhật." : "Cột mốc mới đã được tạo." });
    setShowDialog(false);
    onRefresh();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("milestones").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Đã xóa cột mốc." });
      onRefresh();
    }
    setDeleteTarget(null);
  };

  // Group milestones by period for display
  const groupedByPeriod = useMemo(() => {
    const groups: Record<string, MilestoneRow[]> = {};
    filteredMilestones.forEach(m => {
      if (!groups[m.period_title]) groups[m.period_title] = [];
      groups[m.period_title].push(m);
    });
    return groups;
  }, [filteredMilestones]);

  return (
    <>
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-xl">Quản lý cột mốc ({milestones.length})</h3>
          <Button size="sm" onClick={openNew} className="bg-accent text-accent-foreground">
            <Plus className="w-4 h-4 mr-2" /> Thêm cột mốc
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm cột mốc..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-9 text-sm" />
          </div>
          <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[150px]">
            <option value="">Tất cả thời kỳ</option>
            {periods.map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedByPeriod).map(([periodTitle, items]) => (
          <div key={periodTitle} className="border border-border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 border-b border-border">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{periodTitle}</h4>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="w-[140px]">ID</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead className="w-[180px]">Giai đoạn</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.sort((a, b) => a.sort_order - b.sort_order).map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs text-muted-foreground">{m.sort_order}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{m.id}</TableCell>
                    <TableCell className="text-sm">{m.title}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{m.phase_title}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(m)} className="h-8 w-8"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(m)} className="h-8 w-8 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}

        {filteredMilestones.length === 0 && (
          <div className="text-center text-muted-foreground py-8">Không tìm thấy cột mốc phù hợp</div>
        )}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">{editing ? "Sửa cột mốc" : "Thêm cột mốc mới"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Tiêu đề cột mốc</Label>
              <Input value={form.title} onChange={(e) => {
                setForm({ ...form, title: e.target.value, ...(editing ? {} : { id: generateId(e.target.value) }) });
              }} placeholder="Chiến thắng Bạch Đằng" />
            </div>

            {!editing && (
              <div>
                <Label>ID (tự động tạo, có thể chỉnh)</Label>
                <Input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} className="font-mono text-sm" placeholder="chien-thang-bach-dang" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Thời kỳ</Label>
                <select value={form.period_id} onChange={(e) => handlePeriodChange(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {periods.map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
                </select>
              </div>
              <div>
                <Label>Giai đoạn</Label>
                <select value={form.phase_id} onChange={(e) => handlePhaseChange(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {getPhases(form.period_id).map((ph) => (<option key={ph.id} value={ph.id}>{ph.name}</option>))}
                </select>
              </div>
            </div>

            <div>
              <Label>Thứ tự sắp xếp</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Hủy</Button>
            <Button onClick={save} className="bg-accent text-accent-foreground">{editing ? "Cập nhật" : "Tạo mới"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa cột mốc?</AlertDialogTitle>
            <AlertDialogDescription>
              Xóa cột mốc "{deleteTarget?.title}" sẽ ảnh hưởng đến tất cả bài viết, câu hỏi quiz liên quan. Bạn có chắc chắn?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MilestonesTab;
