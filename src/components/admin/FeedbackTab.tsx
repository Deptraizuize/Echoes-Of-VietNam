import { useState } from "react";
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
import { MessageSquare, Send, CheckCircle, Clock, Eye } from "lucide-react";

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

  const statusBadge: Record<string, React.ReactNode> = {
    new: <span className="inline-flex items-center gap-1 text-xs text-accent"><Clock className="w-3 h-3" />Mới</span>,
    read: <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Eye className="w-3 h-3" />Đã xem</span>,
    replied: <span className="inline-flex items-center gap-1 text-xs text-green-500"><CheckCircle className="w-3 h-3" />Đã phản hồi</span>,
  };

  return (
    <div>
      <h3 className="font-serif text-xl flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-accent" />
        Góp ý từ người dùng ({newCount} mới)
      </h3>

      {feedback.length > 0 ? (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead className="hidden md:table-cell">Nội dung</TableHead>
                <TableHead className="w-28">Ngày</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedback.slice(0, 50).map((fb) => (
                <TableRow key={fb.id}>
                  <TableCell>{statusBadge[fb.status]}</TableCell>
                  <TableCell className="font-medium text-sm max-w-[150px] truncate">{fb.subject}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs truncate hidden md:table-cell">{fb.message}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(fb.created_at).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {fb.status === "new" && (
                        <Button variant="ghost" size="sm" onClick={() => markRead(fb.id)} className="text-xs h-7">
                          <Eye className="w-3 h-3" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => openReply(fb)} className="text-xs h-7">
                        <Send className="w-3 h-3" />
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
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Chưa có góp ý nào.</p>
        </div>
      )}

      {/* Reply Dialog */}
      <Dialog open={replyDialog} onOpenChange={setReplyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Phản hồi góp ý</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tiêu đề</p>
                <p className="text-sm font-medium">{selected.subject}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Nội dung</p>
                <p className="text-sm bg-muted/50 rounded-lg p-3">{selected.message}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Phản hồi</p>
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Nhập phản hồi..."
                  rows={4}
                  maxLength={2000}
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
