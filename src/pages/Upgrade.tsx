import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import UserHeader from "@/components/layout/UserHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Crown, Heart, Zap, Star, CheckCircle, Clock, XCircle, QrCode, ArrowLeft, Bot, MapPin, Upload, ImageIcon, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const PLANS = [
  { id: "monthly", label: "1 Tháng", price: "19.000đ", duration: "30 ngày", popular: false },
  { id: "yearly", label: "1 Năm", price: "199.000đ", duration: "365 ngày", popular: true },
] as const;

type PlanId = typeof PLANS[number]["id"];

const PERKS = [
  { icon: <Heart className="w-4 h-4 text-destructive" />, title: "10 Tim/ngày", desc: "Gấp đôi số lượt làm quiz" },
  { icon: <Zap className="w-4 h-4 text-accent" />, title: "Nhân đôi điểm", desc: "x2 điểm khi đạt ≥6/10" },
  { icon: <Bot className="w-4 h-4 text-accent" />, title: "Trợ lý AI", desc: "Hỏi đáp chuyên sâu lịch sử" },
  { icon: <MapPin className="w-4 h-4 text-accent" />, title: "Tra cứu bản đồ", desc: "Khám phá di tích, địa điểm" },
  { icon: <Star className="w-4 h-4 text-accent" />, title: "Huy hiệu vàng", desc: "Khung avatar Premium" },
  { icon: <Crown className="w-4 h-4 text-accent" />, title: "Truy cập sớm", desc: "Xem trước tính năng mới" },
];

const Upgrade = () => {
  const navigate = useNavigate();
  const { user, loading, isPremium: authIsPremium } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpires, setPremiumExpires] = useState<string | null>(null);
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("monthly");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !user) { navigate("/auth"); return; }
    if (!loading && authIsPremium) setIsPremium(true);
    if (user) fetchStatus();
  }, [user, loading, authIsPremium]);

  const fetchStatus = async () => {
    const [{ data: profile }, { data: requests }, { data: settings }] = await Promise.all([
      supabase.from("profiles").select("is_premium, premium_expires_at").eq("user_id", user!.id).single(),
      supabase.from("premium_requests").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(1),
      supabase.from("payment_settings").select("setting_key, setting_value").eq("is_active", true),
    ]);
    if (profile) {
      setIsPremium(profile.is_premium);
      setPremiumExpires(profile.premium_expires_at);
    }
    if (requests && requests.length > 0) setPendingRequest(requests[0]);
    if (settings) {
      const map: Record<string, string> = {};
      settings.forEach((s: any) => { map[s.setting_key] = s.setting_value; });
      setPaymentSettings(map);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Ảnh quá lớn", description: "Vui lòng chọn ảnh dưới 5MB", variant: "destructive" });
      return;
    }
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const submitRequest = async () => {
    if (!user || !proofFile) {
      toast({ title: "Thiếu ảnh", description: "Vui lòng chọn ảnh chuyển khoản", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      // Upload proof image
      const ext = proofFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("payment-proofs").upload(path, proofFile);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from("payment-proofs").getPublicUrl(path);

      // Create request
      const { error } = await supabase.from("premium_requests").insert({
        user_id: user.id,
        plan_type: selectedPlan,
        proof_image_url: urlData.publicUrl,
      });
      if (error) throw error;

      toast({ title: "Đã gửi!", description: "Yêu cầu nâng cấp sẽ được xử lý trong 24h." });
      setProofFile(null);
      setProofPreview(null);
      fetchStatus();
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" });
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

  const statusConfig: Record<string, { icon: React.ReactNode; bg: string; border: string }> = {
    pending: { icon: <Clock className="w-5 h-5 text-accent" />, bg: "bg-accent/5", border: "border-accent/15" },
    approved: { icon: <CheckCircle className="w-5 h-5 text-green-500" />, bg: "bg-green-500/5", border: "border-green-500/15" },
    rejected: { icon: <XCircle className="w-5 h-5 text-destructive" />, bg: "bg-destructive/5", border: "border-destructive/15" },
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 dong-son-pattern opacity-[0.03] pointer-events-none" />
      <UserHeader />
      <main className="container mx-auto px-4 md:px-12 py-8 md:py-16 max-w-4xl relative z-10">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Hero */}
          <div className="text-center mb-10">
            <Badge className="bg-accent/10 text-accent border-accent/20 mb-4">
              <Crown className="w-3 h-3 mr-1" /> Premium
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">Người Yêu Sử</h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
              Nâng cấp tài khoản để mở khóa toàn bộ đặc quyền học lịch sử
            </p>
          </div>

          {/* Already Premium */}
          {isPremium ? (
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 md:p-8 text-center mb-10">
              <Crown className="w-10 h-10 text-accent mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-2">Bạn đã là Người Yêu Sử!</h3>
              <p className="text-sm text-muted-foreground mb-3">Tận hưởng toàn bộ đặc quyền Premium.</p>
              {premiumExpires && (
                <div className="inline-flex items-center gap-2 bg-background/80 border border-border rounded-lg px-4 py-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">
                    Hết hạn: {new Date(premiumExpires).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Plan Selection */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
                {PLANS.map((plan) => (
                  <motion.button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-4 md:p-6 rounded-xl border-2 transition-all text-left ${
                      selectedPlan === plan.id
                        ? "border-accent bg-accent/5 shadow-md"
                        : "border-border bg-card hover:border-accent/30"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[10px] font-bold px-3 py-0.5 rounded-full">
                        Tiết kiệm
                      </span>
                    )}
                    <div className="text-xl md:text-2xl font-bold text-foreground mb-1">{plan.price}</div>
                    <div className="text-sm text-muted-foreground">{plan.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{plan.duration}</div>
                    {selectedPlan === plan.id && (
                      <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-accent" />
                    )}
                  </motion.button>
                ))}
              </div>
            </>
          )}

          {/* Perks Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 md:gap-4 mb-10">
            {PERKS.map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                className="p-3 md:p-5 bg-card border border-border rounded-xl hover:border-accent/30 transition-colors"
              >
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-muted flex items-center justify-center mb-2 md:mb-3">
                  {perk.icon}
                </div>
                <h4 className="font-semibold text-foreground text-[11px] md:text-sm mb-0.5 md:mb-1">{perk.title}</h4>
                <p className="text-[10px] md:text-xs text-muted-foreground leading-snug">{perk.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Payment & Upload Section (only if not premium) */}
          {!isPremium && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* QR Section */}
              <div className="p-6 md:p-8 border-b border-border">
                <h3 className="font-bold text-lg text-foreground mb-2 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-accent" />
                  Thanh toán qua QR
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Quét mã QR bên dưới để chuyển khoản. Sau khi chuyển, chụp ảnh chuyển khoản và gửi yêu cầu.
                </p>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {paymentSettings.qr_image_url ? (
                    <img src={paymentSettings.qr_image_url} alt="QR thanh toán" className="w-48 h-48 rounded-xl object-contain border border-border" />
                  ) : (
                    <div className="w-48 h-48 bg-muted border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground">
                      <QrCode className="w-12 h-12 mb-2" />
                      <span className="text-xs">Mã QR thanh toán</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-3 text-sm w-full">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Ngân hàng</span>
                      <span className="font-medium text-foreground">{paymentSettings.bank_name || "—"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Số tài khoản</span>
                      <span className="font-medium text-foreground">{paymentSettings.bank_account || "—"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Chủ tài khoản</span>
                      <span className="font-medium text-foreground">{paymentSettings.bank_owner || "—"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Số tiền</span>
                      <span className="font-medium text-accent">
                        {PLANS.find(p => p.id === selectedPlan)?.price}
                      </span>
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
                  <div className={`flex items-start gap-3 ${statusConfig.pending.bg} border ${statusConfig.pending.border} rounded-lg p-4`}>
                    {statusConfig.pending.icon}
                    <div>
                      <p className="font-medium text-foreground text-sm">Yêu cầu đang chờ duyệt</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Gói: {PLANS.find(p => p.id === pendingRequest.plan_type)?.label || pendingRequest.plan_type} — Admin sẽ xử lý trong 24h
                      </p>
                      {pendingRequest.proof_image_url && (
                        <img src={pendingRequest.proof_image_url} alt="Ảnh CK" className="mt-3 w-32 h-32 object-cover rounded-lg border border-border" />
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {pendingRequest && pendingRequest.status === "rejected" && (
                      <div className={`flex items-start gap-3 ${statusConfig.rejected.bg} border ${statusConfig.rejected.border} rounded-lg p-4 mb-4`}>
                        {statusConfig.rejected.icon}
                        <div>
                          <p className="font-medium text-foreground text-sm">Yêu cầu trước bị từ chối</p>
                          {pendingRequest.admin_note && (
                            <p className="text-xs text-muted-foreground mt-1">Lý do: {pendingRequest.admin_note}</p>
                          )}
                        </div>
                      </div>
                    )}
                    <h4 className="font-semibold text-foreground mb-4">Gửi yêu cầu nâng cấp</h4>

                    {/* Image Upload */}
                    <div className="mb-4">
                      <label className="text-sm text-muted-foreground mb-2 block">Ảnh chuyển khoản *</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {proofPreview ? (
                        <div className="relative inline-block">
                          <img src={proofPreview} alt="Preview" className="w-40 h-40 object-cover rounded-xl border border-border" />
                          <button
                            onClick={() => { setProofFile(null); setProofPreview(null); }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-40 h-40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:border-accent/50 hover:text-accent transition-colors"
                        >
                          <Upload className="w-6 h-6 mb-2" />
                          <span className="text-xs">Chọn ảnh</span>
                        </button>
                      )}
                    </div>

                    <Button
                      onClick={submitRequest}
                      disabled={submitting || !proofFile}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
                    >
                      {submitting ? "Đang gửi..." : `Gửi yêu cầu — ${PLANS.find(p => p.id === selectedPlan)?.price}`}
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
