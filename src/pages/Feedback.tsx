import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import UserHeader from "@/components/layout/UserHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, ArrowLeft, Clock, CheckCircle, Send } from "lucide-react";
import { motion } from "framer-motion";

const Feedback = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [myFeedback, setMyFeedback] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchFeedback();
  }, [user, loading]);

  const fetchFeedback = async () => {
    const { data } = await supabase
      .from("feedback")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setMyFeedback(data);
  };

  const handleSubmit = async () => {
    if (!user || !subject.trim() || !message.trim()) {
      toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ tiêu đề và nội dung.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("feedback").insert({
      user_id: user.id,
      subject: subject.trim(),
      message: message.trim(),
    });
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Đã gửi!", description: "Cảm ơn bạn đã góp ý." });
      setSubject("");
      setMessage("");
      fetchFeedback();
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UserHeader />
      <main className="container mx-auto px-4 md:px-12 py-8 md:py-16 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">Góp ý & Hỗ trợ</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Gửi phản hồi để giúp chúng tôi cải thiện trải nghiệm.
            </p>
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-xl p-5 md:p-8 mb-8">
            <div className="space-y-4">
              <div>
                <Label>Tiêu đề</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="VD: Đề xuất thêm nội dung..."
                  maxLength={200}
                />
              </div>
              <div>
                <Label>Nội dung</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mô tả chi tiết góp ý hoặc vấn đề của bạn..."
                  rows={5}
                  maxLength={2000}
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !subject.trim() || !message.trim()}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? "Đang gửi..." : "Gửi góp ý"}
              </Button>
            </div>
          </div>

          {/* History */}
          {myFeedback.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-4">Lịch sử góp ý</h3>
              <div className="space-y-3">
                {myFeedback.map((fb) => (
                  <div key={fb.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground text-sm">{fb.subject}</h4>
                      <div className="flex items-center gap-1.5">
                        {fb.status === "replied" ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {fb.status === "replied" ? "Đã phản hồi" : fb.status === "read" ? "Đã xem" : "Mới"}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{fb.message}</p>
                    {fb.admin_reply && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs font-medium text-accent mb-1">Phản hồi từ admin:</p>
                        <p className="text-xs text-foreground">{fb.admin_reply}</p>
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {new Date(fb.created_at).toLocaleString("vi-VN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Feedback;
