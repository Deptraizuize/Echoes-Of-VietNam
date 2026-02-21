import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Gift, Plus, Trash2, Edit, CheckCircle, Clock, XCircle, Award, Shield, Crown, X } from "lucide-react";

interface BadgeReq {
  badge_type: string;
  id: string;
  name?: string;
}

interface Reward {
  id: string;
  title: string;
  description: string | null;
  points_cost: number;
  image_url: string | null;
  reward_type: string;
  is_active: boolean;
  stock: number | null;
  required_badges?: BadgeReq[];
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

interface Milestone {
  id: string;
  title: string;
  phase_id: string;
  phase_title: string;
  period_id: string;
  period_title: string;
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
  const [badgeReqs, setBadgeReqs] = useState<BadgeReq[]>([]);
  const [processing, setProcessing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Reward | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [badgePickerType, setBadgePickerType] = useState<string>("milestone");
  const [badgePickerId, setBadgePickerId] = useState<string>("");

  useEffect(() => {
    const userIds = [...new Set(redemptions.map((r) => r.user_id))];
    if (userIds.length === 0) return;
    const fetchNames = async () => {
      const { data } = await supabase.from("profiles").select("user_id, display_name").in("user_id", userIds);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((p) => { map[p.user_id] = p.display_name || "Không tên"; });
        setUserNames(map);
      }
    };
    fetchNames();
  }, [redemptions]);

  useEffect(() => {
    supabase.from("milestones").select("id, title, phase_id, phase_title, period_id, period_title").order("sort_order").then(({ data }) => {
      if (data) setMilestones(data);
    });
  }, []);

  const phases = [...new Map(milestones.map(m => [m.phase_id, { id: m.phase_id, title: m.phase_title }])).values()];
  const periods = [...new Map(milestones.map(m => [m.period_id, { id: m.period_id, title: m.period_title }])).values()];

  const getPickerOptions = () => {
    if (badgePickerType === "milestone") return milestones.map(m => ({ id: m.id, name: m.title }));
    if (badgePickerType === "phase") return phases.map(p => ({ id: p.id, name: p.title }));
    return periods.map(p => ({ id: p.id, name: p.title }));
  };

  const addBadgeReq = () => {
    if (!badgePickerId) return;
    if (badgeReqs.some(b => b.badge_type === badgePickerType && b.id === badgePickerId)) return;
    const opts = getPickerOptions();
    const found = opts.find(o => o.id === badgePickerId);
    setBadgeReqs([...badgeReqs, { badge_type: badgePickerType, id: badgePickerId, name: found?.name || badgePickerId }]);
    setBadgePickerId("");
  };

  const removeBadgeReq = (idx: number) => setBadgeReqs(badgeReqs.filter((_, i) => i !== idx));

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", description: "", points_cost: 100, image_url: "", reward_type: "voucher", stock: "" });
    setBadgeReqs([]);
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
    setBadgeReqs(r.required_badges || []);
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
      required_badges: badgeReqs.length > 0 ? badgeReqs : [],
    };

    if (editing) {
      const { error } = await supabase.from("rewards").update(payload as any).eq("id", editing.id);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); setProcessing(false); return; }
    } else {
      const { error } = await supabase.from("rewards").insert(payload as any);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); setProcessing(false); return; }
    }

    toast({ title: "Đã lưu!" });
    setRewardDialog(false);
    setProcessing(false);
    onRefresh();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("rewards").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Đã xóa phần thưởng." });
      onRefresh();
    }
    setDeleteTarget(null);
  };

  const updateRedemptionStatus = async (id: string, status: string) => {
    await supabase.from("reward_redemptions").update({ status }).eq("id", id);
    toast({ title: "Đã cập nhật!" });
    onRefresh();
  };

  const getRewardTitle = (rewardId: string) => rewards.find(r => r.id === rewardId)?.title || "—";
  const pendingRedemptions = redemptions.filter((r) => r.status === "pending");

  const badgeTypeIcon: Record<string, React.ReactNode> = {
    milestone: <Award className="w-3 h-3" />,
    phase: <Shield className="w-3 h-3" />,
    period: <Crown className="w-3 h-3" />,
  };

  const badgeTypeColor: Record<string, string> = {
    milestone: "bg-accent/10 text-accent border-accent/20",
    phase: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    period: "bg-amber-500/10 text-amber-600 border-amber-500/20",
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
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Phần thưởng</TableHead>
                  <TableHead>Điểm</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead className="w-32"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRedemptions.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm font-medium">
                      {userNames[r.user_id] || r.user_id.slice(0, 8) + "..."}
                    </TableCell>
                    <TableCell className="text-sm">{getRewardTitle(r.reward_id)}</TableCell>
                    <TableCell className="text-sm font-bold text-accent">{r.points_spent}</TableCell>
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
                  <TableHead>Huy hiệu YC</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewards.map((r) => (
                  <TableRow key={r.id} className={!r.is_active ? "opacity-50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {r.image_url && <img src={r.image_url} alt="" className="w-8 h-8 rounded object-cover border border-border" />}
                        <div>
                          <span className="font-medium text-sm">{r.title}</span>
                          {!r.is_active && <span className="text-[10px] text-muted-foreground ml-2">(ẩn)</span>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.reward_type}</TableCell>
                    <TableCell className="text-sm font-bold text-accent">{r.points_cost}</TableCell>
                    <TableCell className="text-sm">{r.stock ?? "∞"}</TableCell>
                    <TableCell>
                      {r.required_badges && r.required_badges.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {r.required_badges.map((b, i) => (
                            <span key={i} className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full border ${badgeTypeColor[b.badge_type] || ""}`}>
                              {badgeTypeIcon[b.badge_type]} {b.name || b.id}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(r)} className="h-8 w-8"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(r)} className="h-8 w-8 text-destructive"><Trash2 className="w-4 h-4" /></Button>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
                  <SelectItem value="ticket">Vé tham quan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>URL hình ảnh</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              {form.image_url && <img src={form.image_url} alt="Preview" className="mt-2 w-full h-24 object-cover rounded-lg border border-border" />}
            </div>

            {/* Badge Requirements */}
            <div className="border-t border-border pt-4">
              <Label className="text-sm font-semibold mb-2 block">Điều kiện huy hiệu (tùy chọn)</Label>
              <p className="text-xs text-muted-foreground mb-3">Người dùng cần có đủ các huy hiệu này để đổi phần thưởng.</p>

              {badgeReqs.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {badgeReqs.map((b, i) => (
                    <span key={i} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${badgeTypeColor[b.badge_type] || ""}`}>
                      {badgeTypeIcon[b.badge_type]}
                      {b.name || b.id}
                      <button onClick={() => removeBadgeReq(i)} className="ml-1 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Select value={badgePickerType} onValueChange={v => { setBadgePickerType(v); setBadgePickerId(""); }}>
                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="milestone">Mốc</SelectItem>
                    <SelectItem value="phase">Giai đoạn</SelectItem>
                    <SelectItem value="period">Thời kỳ</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={badgePickerId} onValueChange={setBadgePickerId}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Chọn..." /></SelectTrigger>
                  <SelectContent>
                    {getPickerOptions().map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={addBadgeReq} disabled={!badgePickerId}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRewardDialog(false)}>Hủy</Button>
            <Button onClick={saveReward} disabled={processing} className="bg-accent text-accent-foreground">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa phần thưởng?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa "{deleteTarget?.title}"? Hành động này không thể hoàn tác.
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

export default RewardsTab;
