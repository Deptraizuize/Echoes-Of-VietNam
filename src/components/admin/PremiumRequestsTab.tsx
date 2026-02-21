import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Crown, ImageIcon, Inbox, AlertCircle } from "lucide-react";

const PLAN_MAP: Record<string, { label: string; days: number; price: string }> = {
  monthly: { label: "1 Tháng", days: 30, price: "19.000đ" },
  yearly: { label: "1 Năm", days: 365, price: "199.000đ" },
};

interface PremiumRequest {
  id: string;
  user_id: string;
  status: string;
  note: string | null;
  admin_note: string | null;
  plan_type: string;
  proof_image_url: string | null;
  created_at: string;
}

interface Props {
  requests: PremiumRequest[];
  onRefresh: () => void;
}

const PremiumRequestsTab = ({ requests, onRefresh }: Props) => {
  const { toast } = useToast();
  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PremiumRequest | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const userIds = [...new Set(requests.map((r) => r.user_id))];
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
  }, [requests]);

  const openReview = (req: PremiumRequest) => {
    setSelectedRequest(req);
    setAdminNote(req.admin_note || "");
    setReviewDialog(true);
  };

  const handleAction = async (action: "approved" | "rejected") => {
    if (!selectedRequest) return;
    setProcessing(true);

    const plan = PLAN_MAP[selectedRequest.plan_type] || PLAN_MAP.monthly;

    const { error } = await supabase
      .from("premium_requests")
      .update({
        status: action,
        admin_note: adminNote.trim() || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", selectedRequest.id);

    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
      setProcessing(false);
      return;
    }

    if (action === "approved") {
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("is_premium, premium_expires_at")
        .eq("user_id", selectedRequest.user_id)
        .single();

      const now = new Date();
      let baseDate = now;
      if (currentProfile?.premium_expires_at) {
        const currentExpiry = new Date(currentProfile.premium_expires_at);
        if (currentExpiry > now) baseDate = currentExpiry;
      }

      const newExpiry = new Date(baseDate.getTime() + plan.days * 24 * 60 * 60 * 1000);

      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ is_premium: true, premium_expires_at: newExpiry.toISOString() })
        .eq("user_id", selectedRequest.user_id);

      if (updateErr) {
        toast({ title: "Lỗi cập nhật profile", description: updateErr.message, variant: "destructive" });
        setProcessing(false);
        return;
      }

      toast({
        title: "Đã duyệt!",
        description: `Gói ${plan.label} cho ${userNames[selectedRequest.user_id] || "người dùng"}. Premium đến ${newExpiry.toLocaleDateString("vi-VN")}.`,
      });
    } else {
      toast({ title: "Đã từ chối yêu cầu." });
    }

    setReviewDialog(false);
    setProcessing(false);
    onRefresh();
  };

  const pending = requests.filter((r) => r.status === "pending");
  const processed = requests.filter((r) => r.status !== "pending");

  const statusBadge = (status: string) => {
    if (status === "approved") return <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-green-500/10 text-green-600 border border-green-500/20 font-medium"><CheckCircle className="w-3 h-3" />Đã duyệt</span>;
    if (status === "rejected") return <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20 font-medium"><XCircle className="w-3 h-3" />Từ chối</span>;
    return <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium"><Clock className="w-3 h-3" />Chờ duyệt</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
          <Crown className="w-5 h-5 text-accent" /> Yêu cầu nâng cấp Premium
        </h3>
        <p className="text-sm text-muted-foreground">Duyệt yêu cầu nâng cấp tài khoản Premium từ người dùng.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Chờ duyệt", value: pending.length, icon: <AlertCircle className="w-4 h-4" />, accent: pending.length > 0 },
          { label: "Đã duyệt", value: requests.filter(r => r.status === "approved").length, icon: <CheckCircle className="w-4 h-4" /> },
          { label: "Từ chối", value: requests.filter(r => r.status === "rejected").length, icon: <XCircle className="w-4 h-4" /> },
        ].map((s, i) => (
          <Card key={i} className={`border-border/60 shadow-none ${s.accent ? "ring-1 ring-accent/20" : ""}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.accent ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                {s.icon}
              </div>
              <div>
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-[11px] text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Requests */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chờ duyệt</h4>
          {pending.map((r) => {
            const plan = PLAN_MAP[r.plan_type] || PLAN_MAP.monthly;
            return (
              <Card key={r.id} className="border-accent/20 bg-accent/[0.03] shadow-none hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                  {r.proof_image_url ? (
                    <button onClick={() => setImagePreview(r.proof_image_url)} className="shrink-0">
                      <img src={r.proof_image_url} alt="Ảnh CK" className="w-20 h-20 object-cover rounded-xl border border-border hover:opacity-80 transition-opacity" />
                    </button>
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center shrink-0">
                      <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-semibold text-sm">{userNames[r.user_id] || "..."}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">
                        {plan.label} — {plan.price}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {new Date(r.created_at).toLocaleString("vi-VN")}
                    </p>
                    {r.note && <p className="text-sm text-foreground mt-1.5 line-clamp-2">{r.note}</p>}
                  </div>
                  <Button size="sm" onClick={() => openReview(r)} className="self-start shrink-0 bg-accent text-accent-foreground">
                    Xem & Duyệt
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Processed Requests */}
      {processed.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Đã xử lý ({processed.length})</h4>
          <Card className="border-border/60 shadow-none overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-28">Trạng thái</TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Gói</TableHead>
                  <TableHead className="w-16">Ảnh</TableHead>
                  <TableHead className="hidden md:table-cell">Ghi chú</TableHead>
                  <TableHead className="w-28">Ngày</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processed.slice(0, 30).map((r) => {
                  const plan = PLAN_MAP[r.plan_type] || PLAN_MAP.monthly;
                  return (
                    <TableRow key={r.id}>
                      <TableCell>{statusBadge(r.status)}</TableCell>
                      <TableCell className="text-sm font-medium">{userNames[r.user_id] || r.user_id.slice(0, 8) + "..."}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{plan.label}</TableCell>
                      <TableCell>
                        {r.proof_image_url ? (
                          <button onClick={() => setImagePreview(r.proof_image_url)}>
                            <img src={r.proof_image_url} alt="" className="w-9 h-9 object-cover rounded-lg border border-border hover:opacity-80 transition-opacity" />
                          </button>
                        ) : <span className="text-xs text-muted-foreground/40">—</span>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate hidden md:table-cell">{r.admin_note || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground tabular-nums">
                        {new Date(r.created_at).toLocaleDateString("vi-VN")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {requests.length === 0 && (
        <Card className="border-border/60 shadow-none">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Inbox className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">Chưa có yêu cầu nâng cấp nào</p>
            <p className="text-xs mt-1">Yêu cầu nâng cấp Premium sẽ hiển thị tại đây.</p>
          </CardContent>
        </Card>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-lg p-2">
          {imagePreview && <img src={imagePreview} alt="Ảnh chuyển khoản" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Duyệt yêu cầu nâng cấp</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex gap-4">
                {selectedRequest.proof_image_url && (
                  <img
                    src={selectedRequest.proof_image_url}
                    alt="Ảnh CK"
                    className="w-28 h-28 object-cover rounded-xl border border-border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setImagePreview(selectedRequest.proof_image_url)}
                  />
                )}
                <div className="space-y-3 flex-1">
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">Người dùng</p>
                    <p className="text-sm font-semibold">{userNames[selectedRequest.user_id] || "Không tên"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">Gói đăng ký</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">
                      {(PLAN_MAP[selectedRequest.plan_type] || PLAN_MAP.monthly).label} — {(PLAN_MAP[selectedRequest.plan_type] || PLAN_MAP.monthly).price}
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">Ngày gửi</p>
                    <p className="text-sm tabular-nums">{new Date(selectedRequest.created_at).toLocaleString("vi-VN")}</p>
                  </div>
                </div>
              </div>
              {selectedRequest.note && (
                <Card className="border-border/60 shadow-none">
                  <CardContent className="p-3">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Ghi chú người dùng</p>
                    <p className="text-sm">{selectedRequest.note}</p>
                  </CardContent>
                </Card>
              )}
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1.5">Ghi chú admin</p>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Ghi chú (tùy chọn)..."
                  maxLength={500}
                  className="resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => handleAction("rejected")} disabled={processing} className="text-destructive hover:text-destructive">
              <XCircle className="w-4 h-4 mr-2" /> Từ chối
            </Button>
            <Button onClick={() => handleAction("approved")} disabled={processing} className="bg-accent text-accent-foreground">
              <CheckCircle className="w-4 h-4 mr-2" /> Duyệt & Nâng cấp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PremiumRequestsTab;
