import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Gift, Plus, Trash2, Edit, CheckCircle, Clock, XCircle } from "lucide-react";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  points_cost: number;
  image_url: string | null;
  reward_type: string;
  is_active: boolean;
  stock: number | null;
}

interface Redemption {
  id: string;
  user_id: string;
  reward_id: string;
  points_spent: number;
  status: string;
  admin_note: string | null;
  created_at: string;
}

interface Props {
  rewards: Reward[];
  redemptions: Redemption[];
  onRefresh: () => void;
}

const RewardsTab = ({ rewards, redemptions, onRefresh }: Props) => {
  const { toast } = useToast();
  const [rewardDialog, setRewardDialog] = useState(false);
  const [editing, setEditing] = useState<Reward | null>(null);
  const [form, setForm] = useState({ title: "", description: "", points_cost: 100, image_url: "", reward_type: "voucher", stock: "" });
  const [processing, setProcessing] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", description: "", points_cost: 100, image_url: "", reward_type: "voucher", stock: "" });
    setRewardDialog(true);
  };

  const openEdit = (r: Reward) => {
    setEditing(r);
    setForm({
      title: r.title,
      description: r.description || "",
      points_cost: r.points_cost,
      image_url: r.image_url || "",
      reward_type: r.reward_type,
      stock: r.stock?.toString() || "",
    });
    setRewardDialog(true);
  };

  const saveReward = async () => {
    if (!form.title.trim() || form.points_cost <= 0) {
      toast({ title: "Lỗi", description: "Kiểm tra tiêu đề và số điểm", variant: "destructive" });
      return;
    }
    setProcessing(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      points_cost: form.points_cost,
      image_url: form.image_url.trim() || null,
      reward_type: form.reward_type,
      stock: form.stock ? parseInt(form.stock) : null,
    };

    if (editing) {
      const { error } = await supabase.from("rewards").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); setProcessing(false); return; }
    } else {
      const { error } = await supabase.from("rewards").insert(payload);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); setProcessing(false); return; }
    }

    toast({ title: "Đã lưu!" });
    setRewardDialog(false);
    setProcessing(false);
    onRefresh();
  };

  const deleteReward = async (id: string) => {
    await supabase.from("rewards").delete().eq("id", id);
    onRefresh();
  };

  const updateRedemptionStatus = async (id: string, status: string) => {
    await supabase.from("reward_redemptions").update({ status }).eq("id", id);
    toast({ title: "Đã cập nhật!" });
    onRefresh();
  };

  const pendingRedemptions = redemptions.filter((r) => r.status === "pending");

  const statusIcon: Record<string, React.ReactNode> = {
    pending: <Clock className="w-3.5 h-3.5 text-accent" />,
    approved: <CheckCircle className="w-3.5 h-3.5 text-green-500" />,
    rejected: <XCircle className="w-3.5 h-3.5 text-destructive" />,
    delivered: <Gift className="w-3.5 h-3.5 text-accent" />,
  };

  return (
    <div className="space-y-8">
      {/* Pending Redemptions */}
      {pendingRedemptions.length > 0 && (
        <div>
          <h4 className="font-serif text-lg mb-3">Yêu cầu đổi thưởng chờ duyệt ({pendingRedemptions.length})</h4>
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Điểm</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead className="w-32"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRedemptions.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.user_id.slice(0, 8)}...</TableCell>
                    <TableCell className="text-sm font-medium">{r.points_spent}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => updateRedemptionStatus(r.id, "approved")} className="h-7 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" /> Duyệt
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => updateRedemptionStatus(r.id, "rejected")} className="h-7 text-xs text-destructive">
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Rewards List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl flex items-center gap-2">
            <Gift className="w-5 h-5 text-accent" />
            Phần thưởng ({rewards.length})
          </h3>
          <Button size="sm" onClick={openNew} className="bg-accent text-accent-foreground">
            <Plus className="w-4 h-4 mr-2" /> Thêm phần thưởng
          </Button>
        </div>

        {rewards.length > 0 ? (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Điểm</TableHead>
                  <TableHead>Kho</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewards.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-sm">{r.title}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.reward_type}</TableCell>
                    <TableCell className="text-sm font-bold text-accent">{r.points_cost}</TableCell>
                    <TableCell className="text-sm">{r.stock ?? "∞"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(r)} className="h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteReward(r.id)} className="h-8 w-8 text-destructive">
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
            <Gift className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Chưa có phần thưởng nào.</p>
          </div>
        )}
      </div>

      {/* Reward Dialog */}
      <Dialog open={rewardDialog} onOpenChange={setRewardDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{editing ? "Sửa phần thưởng" : "Thêm phần thưởng"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên phần thưởng</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="VD: Voucher 50k" maxLength={200} />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Chi tiết..." maxLength={500} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Điểm cần đổi</Label>
                <Input type="number" value={form.points_cost} onChange={(e) => setForm({ ...form, points_cost: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Số lượng (trống = vô hạn)</Label>
                <Input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="∞" />
              </div>
            </div>
            <div>
              <Label>Loại</Label>
              <Select value={form.reward_type} onValueChange={(v) => setForm({ ...form, reward_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="voucher">Voucher</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="badge">Huy hiệu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>URL hình ảnh</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRewardDialog(false)}>Hủy</Button>
            <Button onClick={saveReward} disabled={processing} className="bg-accent text-accent-foreground">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RewardsTab;
