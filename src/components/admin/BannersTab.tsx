import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
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
import { Image, Plus, Trash2, Edit } from "lucide-react";

interface AdBanner {
  id: string;
  title: string;
  image_url: string | null;
  link_url: string | null;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

interface Props {
  banners: AdBanner[];
  onRefresh: () => void;
}

const BannersTab = ({ banners, onRefresh }: Props) => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdBanner | null>(null);
  const [form, setForm] = useState({ title: "", image_url: "", link_url: "", description: "", display_order: 0 });
  const [processing, setProcessing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdBanner | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", image_url: "", link_url: "", description: "", display_order: 0 });
    setDialogOpen(true);
  };

  const openEdit = (b: AdBanner) => {
    setEditing(b);
    setForm({
      title: b.title,
      image_url: b.image_url || "",
      link_url: b.link_url || "",
      description: b.description || "",
      display_order: b.display_order,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast({ title: "Lỗi", description: "Tiêu đề không được trống", variant: "destructive" });
      return;
    }
    setProcessing(true);
    const payload = {
      title: form.title.trim(),
      image_url: form.image_url.trim() || null,
      link_url: form.link_url.trim() || null,
      description: form.description.trim() || null,
      display_order: form.display_order,
    };

    if (editing) {
      const { error } = await supabase.from("ad_banners").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); setProcessing(false); return; }
    } else {
      const { error } = await supabase.from("ad_banners").insert(payload);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); setProcessing(false); return; }
    }

    toast({ title: "Đã lưu!" });
    setDialogOpen(false);
    setProcessing(false);
    onRefresh();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("ad_banners").update({ is_active: !current }).eq("id", id);
    onRefresh();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("ad_banners").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Đã xóa banner." });
      onRefresh();
    }
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-xl flex items-center gap-2">
          <Image className="w-5 h-5 text-accent" />
          Quảng cáo Banner ({banners.length})
        </h3>
        <Button size="sm" onClick={openNew} className="bg-accent text-accent-foreground">
          <Plus className="w-4 h-4 mr-2" /> Thêm banner
        </Button>
      </div>

      {banners.length > 0 ? (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Trạng thái</TableHead>
                <TableHead className="w-16">Ảnh</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead className="hidden md:table-cell">Link</TableHead>
                <TableHead className="w-16">Thứ tự</TableHead>
                <TableHead className="w-28"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((b) => (
                <TableRow key={b.id} className={!b.is_active ? "opacity-50" : ""}>
                  <TableCell>
                    <Switch checked={b.is_active} onCheckedChange={() => toggleActive(b.id, b.is_active)} />
                  </TableCell>
                  <TableCell>
                    {b.image_url ? (
                      <button onClick={() => setImagePreview(b.image_url)}>
                        <img src={b.image_url} alt="" className="w-10 h-10 rounded object-cover border border-border hover:opacity-80 transition-opacity" />
                      </button>
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <Image className="w-4 h-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium text-sm">{b.title}</span>
                      {b.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{b.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate hidden md:table-cell">
                    {b.link_url || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-center">{b.display_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(b)} className="h-8 w-8">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(b)} className="h-8 w-8 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Image className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Chưa có banner nào. Thêm banner để hiển thị trước quiz.</p>
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{editing ? "Sửa banner" : "Thêm banner mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tiêu đề</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="VD: Nâng cấp Premium" maxLength={200} />
            </div>
            <div>
              <Label>URL hình ảnh</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg border border-border" />
              )}
            </div>
            <div>
              <Label>Link đích (khi click)</Label>
              <Input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="https://... hoặc /upgrade" />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn..." maxLength={500} />
            </div>
            <div>
              <Label>Thứ tự hiển thị</Label>
              <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button onClick={save} disabled={processing} className="bg-accent text-accent-foreground">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-lg p-2">
          {imagePreview && (
            <img src={imagePreview} alt="Xem ảnh banner" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa banner?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa banner "{deleteTarget?.title}"? Hành động này không thể hoàn tác.
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
    </div>
  );
};

export default BannersTab;
