import { useState } from "react";
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
import { MessageSquare, Send, CheckCircle, Clock, Eye, Inbox, MessageCircle } from "lucide-react";

interface FeedbackRow {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  admin_reply: string | null;
  created_at: string;
}

interface Props {
  feedback: FeedbackRow[];
  onRefresh: () => void;
}

const FeedbackTab = ({ feedback, onRefresh }: Props) => {
  const { toast } = useToast();
  const [replyDialog, setReplyDialog] = useState(false);
  const [selected, setSelected] = useState<FeedbackRow | null>(null);
  const [reply, setReply] = useState("");
  const [processing, setProcessing] = useState(false);

  const openReply = (fb: FeedbackRow) => {
    setSelected(fb);
    setReply(fb.admin_reply || "");
    setReplyDialog(true);
  };

  const handleReply = async () => {
    if (!selected || !reply.trim()) return;
    setProcessing(true);
    const { error } = await supabase
      .from("feedback")
      .update({
        status: "replied",
        admin_reply: reply.trim(),
        replied_at: new Date().toISOString(),
      })
      .eq("id", selected.id);

    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Đã phản hồi!" });
      setReplyDialog(false);
      onRefresh();
    }
    setProcessing(false);
  };

  const markRead = async (id: string) => {
    await supabase.from("feedback").update({ status: "read" }).eq("id", id);
    onRefresh();
  };

  const newCount = feedback.filter((f) => f.status === "new").length;
  const readCount = feedback.filter((f) => f.status === "read").length;
  const repliedCount = feedback.filter((f) => f.status === "replied").length;

  const statusConfig: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
    new: { icon: <Clock className="w-3 h-3" />, label: "Mới", className: "bg-accent/10 text-accent border border-accent/20" },
    read: { icon: <Eye className="w-3 h-3" />, label: "Đã xem", className: "bg-muted text-muted-foreground border border-border" },
    replied: { icon: <CheckCircle className="w-3 h-3" />, label: "Đã phản hồi", className: "bg-green-500/10 text-green-600 border border-green-500/20" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
          <MessageSquare className="w-5 h-5 text-accent" /> Góp ý từ người dùng
        </h3>
        <p className="text-sm text-muted-foreground">Quản lý và phản hồi các góp ý, báo lỗi từ người dùng.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Mới", value: newCount, icon: <Clock className="w-4 h-4" />, accent: newCount > 0 },
          { label: "Đã xem", value: readCount, icon: <Eye className="w-4 h-4" /> },
          { label: "Đã phản hồi", value: repliedCount, icon: <CheckCircle className="w-4 h-4" /> },
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

      {/* Table */}
      {feedback.length > 0 ? (
        <Card className="border-border/60 shadow-none overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-28">Trạng thái</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead className="hidden md:table-cell">Nội dung</TableHead>
                <TableHead className="w-28">Ngày</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedback.slice(0, 50).map((fb) => {
                const sc = statusConfig[fb.status] || statusConfig.new;
                return (
                  <TableRow key={fb.id} className={fb.status === "new" ? "bg-accent/[0.02]" : ""}>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full font-medium ${sc.className}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-sm max-w-[180px] truncate">{fb.subject}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate hidden md:table-cell">{fb.message}</TableCell>
                    <TableCell className="text-xs text-muted-foreground tabular-nums">
                      {new Date(fb.created_at).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {fb.status === "new" && (
                          <Button variant="ghost" size="icon" onClick={() => markRead(fb.id)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => openReply(fb)} className="h-8 w-8 text-accent hover:text-accent">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="border-border/60 shadow-none">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Inbox className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">Chưa có góp ý nào</p>
            <p className="text-xs mt-1">Các góp ý từ người dùng sẽ hiển thị tại đây.</p>
          </CardContent>
        </Card>
      )}

      {/* Reply Dialog */}
      <Dialog open={replyDialog} onOpenChange={setReplyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Phản hồi góp ý</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <Card className="border-border/60 shadow-none">
                <CardContent className="p-4 space-y-2">
                  <p className="text-sm font-semibold">{selected.subject}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selected.message}</p>
                  <p className="text-[11px] text-muted-foreground/60">{new Date(selected.created_at).toLocaleString("vi-VN")}</p>
                </CardContent>
              </Card>
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">Phản hồi của bạn</p>
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Nhập phản hồi..."
                  rows={4}
                  maxLength={2000}
                  className="resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialog(false)}>Hủy</Button>
            <Button onClick={handleReply} disabled={processing || !reply.trim()} className="bg-accent text-accent-foreground">
              <Send className="w-4 h-4 mr-2" /> Gửi phản hồi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbackTab;
