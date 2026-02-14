import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, Crown } from "lucide-react";

interface PremiumRequest {
  id: string;
  user_id: string;
  status: string;
  note: string | null;
  admin_note: string | null;
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

  const openReview = (req: PremiumRequest) => {
    setSelectedRequest(req);
    setAdminNote(req.admin_note || "");
    setReviewDialog(true);
  };

  const handleAction = async (action: "approved" | "rejected") => {
    if (!selectedRequest) return;
    setProcessing(true);

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

    // If approved, update user's premium status
    if (action === "approved") {
      await supabase
        .from("profiles")
        .update({
          is_premium: true,
          premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("user_id", selectedRequest.user_id);
    }

    toast({ title: "Thành công!", description: action === "approved" ? "Đã duyệt nâng cấp." : "Đã từ chối yêu cầu." });
    setReviewDialog(false);
    setProcessing(false);
    onRefresh();
  };

  const pending = requests.filter((r) => r.status === "pending");
  const processed = requests.filter((r) => r.status !== "pending");

  const statusIcon: Record<string, React.ReactNode> = {
    pending: <Clock className="w-4 h-4 text-accent" />,
    approved: <CheckCircle className="w-4 h-4 text-green-500" />,
    rejected: <XCircle className="w-4 h-4 text-destructive" />,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-xl flex items-center gap-2">
          <Crown className="w-5 h-5 text-accent" />
          Yêu cầu nâng cấp ({pending.length} chờ duyệt)
        </h3>
      </div>

      {pending.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Chờ duyệt</h4>
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead className="w-32">Thời gian</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.user_id.slice(0, 8)}...</TableCell>
                    <TableCell className="text-sm max-w-xs truncate">{r.note || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openReview(r)}>
                        Duyệt
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {processed.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Đã xử lý ({processed.length})</h4>
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Ghi chú admin</TableHead>
                  <TableHead className="w-32">Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processed.slice(0, 20).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {statusIcon[r.status]}
                        <span className="text-xs">{r.status === "approved" ? "Duyệt" : "Từ chối"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{r.user_id.slice(0, 8)}...</TableCell>
                    <TableCell className="text-xs max-w-xs truncate">{r.admin_note || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("vi-VN")}
                    </TableCell>
                  </TableRow>
                ))}
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

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Duyệt yêu cầu nâng cấp</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">User ID</p>
                <p className="text-sm font-mono">{selectedRequest.user_id}</p>
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
