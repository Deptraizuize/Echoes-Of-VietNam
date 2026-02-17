import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, Crown, ImageIcon, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  // Fetch display names for all user_ids in requests
  useEffect(() => {
    const userIds = [...new Set(requests.map((r) => r.user_id))];
    if (userIds.length === 0) return;
    const fetchNames = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
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

    // Update request status
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
      // Fetch current premium_expires_at to support cumulative time
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("is_premium, premium_expires_at")
        .eq("user_id", selectedRequest.user_id)
        .single();

      // Calculate new expiry: if currently premium and not expired, add from current expiry
      const now = new Date();
      let baseDate = now;
      if (currentProfile?.premium_expires_at) {
        const currentExpiry = new Date(currentProfile.premium_expires_at);
        if (currentExpiry > now) {
          baseDate = currentExpiry; // Cumulative: add from current expiry
        }
      }

      const newExpiry = new Date(baseDate.getTime() + plan.days * 24 * 60 * 60 * 1000);

      const { error: updateErr } = await supabase
        .from("profiles")
        .update({
          is_premium: true,
          premium_expires_at: newExpiry.toISOString(),
        })
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
    if (status === "approved") return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">Đã duyệt</Badge>;
    if (status === "rejected") return <Badge variant="destructive" className="text-xs">Từ chối</Badge>;
    return <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">Chờ duyệt</Badge>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-xl flex items-center gap-2">
          <Crown className="w-5 h-5 text-accent" />
          Yêu cầu nâng cấp ({pending.length} chờ duyệt)
        </h3>
      </div>

      {/* Pending Requests */}
      {pending.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Chờ duyệt</h4>
          <div className="space-y-3">
            {pending.map((r) => {
              const plan = PLAN_MAP[r.plan_type] || PLAN_MAP.monthly;
              return (
                <div key={r.id} className="border border-accent/20 bg-accent/5 rounded-xl p-4 flex flex-col sm:flex-row gap-4">
                  {r.proof_image_url ? (
                    <button onClick={() => setImagePreview(r.proof_image_url)} className="shrink-0">
                      <img src={r.proof_image_url} alt="Ảnh CK" className="w-20 h-20 object-cover rounded-lg border border-border hover:opacity-80 transition-opacity" />
                    </button>
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center shrink-0">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-foreground">{userNames[r.user_id] || "..."}</span>
                      <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">{plan.label} — {plan.price}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString("vi-VN")}
                    </p>
                    {r.note && <p className="text-sm text-foreground mt-1">{r.note}</p>}
                  </div>
                  <Button size="sm" onClick={() => openReview(r)} className="self-start shrink-0">
                    Duyệt
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Processed Requests */}
      {processed.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Đã xử lý ({processed.length})</h4>
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Gói</TableHead>
                  <TableHead>Ảnh CK</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead className="w-32">Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processed.slice(0, 30).map((r) => {
                  const plan = PLAN_MAP[r.plan_type] || PLAN_MAP.monthly;
                  return (
                    <TableRow key={r.id}>
                      <TableCell>{statusBadge(r.status)}</TableCell>
                      <TableCell className="text-sm">{userNames[r.user_id] || r.user_id.slice(0, 8) + "..."}</TableCell>
                      <TableCell className="text-xs">{plan.label}</TableCell>
                      <TableCell>
                        {r.proof_image_url ? (
                          <button onClick={() => setImagePreview(r.proof_image_url)}>
                            <img src={r.proof_image_url} alt="" className="w-8 h-8 object-cover rounded border border-border hover:opacity-80" />
                          </button>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-xs max-w-xs truncate">{r.admin_note || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString("vi-VN")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Crown className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Chưa có yêu cầu nâng cấp nào.</p>
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-lg p-2">
          {imagePreview && (
            <img src={imagePreview} alt="Ảnh chuyển khoản" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Duyệt yêu cầu nâng cấp</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex gap-4">
                {selectedRequest.proof_image_url && (
                  <img
                    src={selectedRequest.proof_image_url}
                    alt="Ảnh CK"
                    className="w-32 h-32 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80"
                    onClick={() => setImagePreview(selectedRequest.proof_image_url)}
                  />
                )}
                <div className="space-y-2 flex-1">
                  <div>
                    <p className="text-xs text-muted-foreground">Người dùng</p>
                    <p className="text-sm font-medium">{userNames[selectedRequest.user_id] || "Không tên"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gói đăng ký</p>
                    <Badge className="bg-accent/10 text-accent border-accent/20">
                      {(PLAN_MAP[selectedRequest.plan_type] || PLAN_MAP.monthly).label} — {(PLAN_MAP[selectedRequest.plan_type] || PLAN_MAP.monthly).price}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ngày gửi</p>
                    <p className="text-sm">{new Date(selectedRequest.created_at).toLocaleString("vi-VN")}</p>
                  </div>
                </div>
              </div>
              {selectedRequest.note && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ghi chú người dùng</p>
                  <p className="text-sm">{selectedRequest.note}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ghi chú admin</p>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Ghi chú (tùy chọn)..."
                  maxLength={500}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => handleAction("rejected")} disabled={processing} className="text-destructive">
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
