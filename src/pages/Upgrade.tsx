import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import UserHeader from "@/components/layout/UserHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Crown, Heart, Zap, Star, CheckCircle, Clock, XCircle, QrCode, ArrowLeft, Bot, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const Upgrade = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isPremium, setIsPremium] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchStatus();
  }, [user, loading]);

  const fetchStatus = async () => {
    const [{ data: profile }, { data: requests }] = await Promise.all([
      supabase.from("profiles").select("is_premium").eq("user_id", user!.id).single(),
      supabase
        .from("premium_requests")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);
    if (profile) setIsPremium(profile.is_premium);
    if (requests && requests.length > 0) setPendingRequest(requests[0]);
  };

  const submitRequest = async () => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("premium_requests").insert({
      user_id: user.id,
      note: note.trim() || null,
    });
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Đã gửi!", description: "Yêu cầu nâng cấp sẽ được xử lý trong 24h." });
      fetchStatus();
      setNote("");
    }
    setSubmitting(false);
  };

  const statusIcon = {
    pending: <Clock className="w-5 h-5 text-accent" />,
    approved: <CheckCircle className="w-5 h-5 text-green-500" />,
    rejected: <XCircle className="w-5 h-5 text-destructive" />,
  };

  const statusText: Record<string, string> = {
    pending: "Đang chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Đã từ chối",
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
      <main className="container mx-auto px-4 md:px-12 py-8 md:py-16 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Hero */}
          <div className="text-center mb-10 md:mb-14">
            <Badge className="bg-accent/10 text-accent border-accent/20 mb-4">
              <Crown className="w-3 h-3 mr-1" /> Premium
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">
              Người Yêu Sử
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
              Nâng cấp tài khoản để mở khóa toàn bộ đặc quyền học lịch sử
            </p>
            <div className="mt-4 text-2xl md:text-3xl font-bold text-accent">
              19.000đ<span className="text-sm font-normal text-muted-foreground">/tháng</span>
            </div>
          </div>

          {/* Perks Grid */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-10 md:mb-14">
            {[
              { icon: <Heart className="w-5 h-5 text-destructive" />, title: "10 Tim/ngày", desc: "Gấp đôi số lượt làm quiz mỗi ngày" },
              { icon: <Zap className="w-5 h-5 text-accent" />, title: "Nhân đôi điểm", desc: "x2 điểm thưởng khi đạt từ 6/10 trở lên" },
              { icon: <Bot className="w-5 h-5 text-accent" />, title: "Trợ lý AI Lịch sử", desc: "Hỏi đáp chuyên sâu, tra cứu di tích, nhân vật và tài liệu" },
              { icon: <MapPin className="w-5 h-5 text-accent" />, title: "Tra cứu bản đồ", desc: "Khám phá di tích, địa điểm lịch sử trên bản đồ VN" },
              { icon: <Star className="w-5 h-5 text-accent" />, title: "Huy hiệu vàng", desc: "Khung avatar và huy hiệu đặc biệt" },
              { icon: <Crown className="w-5 h-5 text-accent" />, title: "Truy cập sớm", desc: "Xem trước nội dung và tính năng mới" },
            ].map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                className="p-4 md:p-5 bg-card border border-border rounded-xl hover:border-accent/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center mb-3">
                  {perk.icon}
                </div>
                <h4 className="font-semibold text-foreground text-sm mb-1">{perk.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{perk.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Already Premium */}
          {isPremium ? (
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 md:p-8 text-center">
              <Crown className="w-10 h-10 text-accent mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-2">Bạn đã là Người Yêu Sử!</h3>
              <p className="text-sm text-muted-foreground">Tận hưởng toàn bộ đặc quyền Premium.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* QR Section */}
              <div className="p-6 md:p-8 border-b border-border">
                <h3 className="font-bold text-lg text-foreground mb-2 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-accent" />
                  Thanh toán qua QR
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Quét mã QR bên dưới để chuyển khoản 19.000đ. Sau khi chuyển khoản, gửi yêu cầu nâng cấp và admin sẽ xác nhận trong 24h.
                </p>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {/* QR Placeholder */}
                  <div className="w-48 h-48 bg-muted border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground">
                    <QrCode className="w-12 h-12 mb-2" />
                    <span className="text-xs">Mã QR thanh toán</span>
                    <span className="text-[10px] mt-1">(Admin sẽ cập nhật)</span>
                  </div>

                  <div className="flex-1 space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Ngân hàng</span>
                      <span className="font-medium text-foreground">Sẽ cập nhật</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Số tài khoản</span>
                      <span className="font-medium text-foreground">Sẽ cập nhật</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Số tiền</span>
                      <span className="font-medium text-accent">19.000đ</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Nội dung CK</span>
                      <span className="font-mono text-xs text-foreground">NGUOIYEUSU {user?.email?.split("@")[0]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Status or Form */}
              <div className="p-6 md:p-8">
                {pendingRequest && pendingRequest.status === "pending" ? (
                  <div className="flex items-center gap-3 bg-accent/5 border border-accent/15 rounded-lg p-4">
                    {statusIcon.pending}
                    <div>
                      <p className="font-medium text-foreground text-sm">Yêu cầu đang chờ duyệt</p>
                      <p className="text-xs text-muted-foreground">
                        Gửi lúc {new Date(pendingRequest.created_at).toLocaleString("vi-VN")} — Admin sẽ xử lý trong 24h
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {pendingRequest && pendingRequest.status === "rejected" && (
                      <div className="flex items-center gap-3 bg-destructive/5 border border-destructive/15 rounded-lg p-4 mb-4">
                        {statusIcon.rejected}
                        <div>
                          <p className="font-medium text-foreground text-sm">Yêu cầu trước bị từ chối</p>
                          {pendingRequest.admin_note && (
                            <p className="text-xs text-muted-foreground">Lý do: {pendingRequest.admin_note}</p>
                          )}
                        </div>
                      </div>
                    )}
                    <h4 className="font-semibold text-foreground mb-3">Gửi yêu cầu nâng cấp</h4>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ghi chú thêm (VD: đã chuyển khoản lúc 14:30 ngày 15/02)..."
                      className="mb-4"
                      maxLength={500}
                    />
                    <Button
                      onClick={submitRequest}
                      disabled={submitting}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
                    >
                      {submitting ? "Đang gửi..." : "Gửi yêu cầu nâng cấp"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Upgrade;
