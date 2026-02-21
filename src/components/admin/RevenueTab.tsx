import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import {
  DollarSign, Plus, Trash2, Edit, TrendingUp, Crown, Megaphone, Handshake, Package, Inbox, ArrowUpRight, ArrowDownRight, User, CalendarDays,
} from "lucide-react";

interface RevenueRecord {
  id: string;
  source_type: string;
  source_label: string;
  amount: number;
  note: string | null;
  reference_id: string | null;
  recorded_by: string | null;
  record_date: string;
  created_at: string;
}

interface PremiumRequest {
  id: string;
  status: string;
  plan_type: string;
  created_at: string;
  user_id: string;
}

interface ProfileInfo {
  user_id: string;
  display_name: string | null;
  is_premium: boolean;
  premium_expires_at: string | null;
}

const SOURCE_TYPES: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  premium: { label: "Premium", icon: <Crown className="w-3.5 h-3.5" />, color: "bg-accent/10 text-accent border-accent/20" },
  ads: { label: "Quảng cáo", icon: <Megaphone className="w-3.5 h-3.5" />, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  collab: { label: "Đối tác", icon: <Handshake className="w-3.5 h-3.5" />, color: "bg-green-500/10 text-green-600 border-green-500/20" },
  other: { label: "Khác", icon: <Package className="w-3.5 h-3.5" />, color: "bg-muted text-muted-foreground border-border" },
};

const formatVND = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

interface Props {
  premiumRequests: PremiumRequest[];
}

const PLAN_PRICE: Record<string, number> = {
  monthly: 19000,
  yearly: 199000,
};

const PLAN_LABEL: Record<string, string> = {
  monthly: "1 Tháng",
  yearly: "1 Năm",
};

const RevenueTab = ({ premiumRequests }: Props) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [records, setRecords] = useState<RevenueRecord[]>([]);
  const [profiles, setProfiles] = useState<Map<string, ProfileInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<RevenueRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RevenueRecord | null>(null);
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({
    source_type: "ads",
    source_label: "",
    amount: 0,
    note: "",
    record_date: new Date().toISOString().slice(0, 10),
  });
  const [filterType, setFilterType] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("");

  const fetchRecords = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("revenue_records")
      .select("*")
      .order("record_date", { ascending: false });
    setRecords((data as RevenueRecord[]) || []);
    setLoading(false);
  };

  // Fetch profiles for premium request user mapping
  useEffect(() => {
    const fetchProfiles = async () => {
      const userIds = [...new Set(premiumRequests.map(r => r.user_id))];
      if (userIds.length === 0) return;
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, is_premium, premium_expires_at")
        .in("user_id", userIds);
      if (data) {
        const map = new Map<string, ProfileInfo>();
        data.forEach(p => map.set(p.user_id, p as ProfileInfo));
        setProfiles(map);
      }
    };
    fetchProfiles();
  }, [premiumRequests]);

  useEffect(() => { fetchRecords(); }, []);

  // Auto-sync approved premium requests as revenue
  useEffect(() => {
    const syncPremiumRevenue = async () => {
      const approved = premiumRequests.filter(r => r.status === "approved");
      if (approved.length === 0) return;
      const { data: existing } = await supabase
        .from("revenue_records")
        .select("reference_id")
        .eq("source_type", "premium")
        .not("reference_id", "is", null);
      const existingIds = new Set((existing || []).map(r => r.reference_id));
      const newApproved = approved.filter(r => !existingIds.has(r.id));
      if (newApproved.length === 0) return;
      const inserts = newApproved.map(r => ({
        source_type: "premium",
        source_label: `Gói ${r.plan_type === "yearly" ? "1 Năm" : "1 Tháng"}`,
        amount: PLAN_PRICE[r.plan_type] || PLAN_PRICE.monthly,
        reference_id: r.id,
        recorded_by: user?.id || null,
        record_date: new Date(r.created_at).toISOString().slice(0, 10),
      }));
      await supabase.from("revenue_records").insert(inserts as any);
      fetchRecords();
    };
    syncPremiumRevenue();
  }, [premiumRequests]);

  const openNew = () => {
    setEditing(null);
    setForm({ source_type: "ads", source_label: "", amount: 0, note: "", record_date: new Date().toISOString().slice(0, 10) });
    setDialog(true);
  };

  const openEdit = (r: RevenueRecord) => {
    setEditing(r);
    setForm({ source_type: r.source_type, source_label: r.source_label, amount: r.amount, note: r.note || "", record_date: r.record_date });
    setDialog(true);
  };

  const saveRecord = async () => {
    if (!form.source_label.trim() || form.amount <= 0) {
      toast({ title: "Lỗi", description: "Kiểm tra mô tả và số tiền", variant: "destructive" });
      return;
    }
    setProcessing(true);
    const payload = {
      source_type: form.source_type,
      source_label: form.source_label.trim(),
      amount: form.amount,
      note: form.note.trim() || null,
      record_date: form.record_date,
      recorded_by: user?.id || null,
    };
    if (editing) {
      const { error } = await supabase.from("revenue_records").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); setProcessing(false); return; }
    } else {
      const { error } = await supabase.from("revenue_records").insert(payload);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); setProcessing(false); return; }
    }
    toast({ title: "Đã lưu!" });
    setDialog(false);
    setProcessing(false);
    fetchRecords();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("revenue_records").delete().eq("id", deleteTarget.id);
    if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); } else { toast({ title: "Đã xóa." }); fetchRecords(); }
    setDeleteTarget(null);
  };

  // Filtered records
  const filtered = useMemo(() => {
    let result = records;
    if (filterType !== "all") result = result.filter(r => r.source_type === filterType);
    if (filterMonth && filterMonth !== "all_months") result = result.filter(r => r.record_date.startsWith(filterMonth));
    return result;
  }, [records, filterType, filterMonth]);

  // Stats
  const totalRevenue = records.reduce((s, r) => s + r.amount, 0);
  const premiumRevenue = records.filter(r => r.source_type === "premium").reduce((s, r) => s + r.amount, 0);
  const adsRevenue = records.filter(r => r.source_type === "ads").reduce((s, r) => s + r.amount, 0);
  const collabRevenue = records.filter(r => r.source_type === "collab" || r.source_type === "other").reduce((s, r) => s + r.amount, 0);
  const filteredTotal = filtered.reduce((s, r) => s + r.amount, 0);

  // Premium detail: map revenue records to user info via premiumRequests
  const premiumDetails = useMemo(() => {
    const requestMap = new Map(premiumRequests.map(r => [r.id, r]));
    return records
      .filter(r => r.source_type === "premium" && r.reference_id)
      .map(r => {
        const req = requestMap.get(r.reference_id!);
        const profile = req ? profiles.get(req.user_id) : null;
        return {
          ...r,
          user_name: profile?.display_name || "Người dùng",
          plan_type: req?.plan_type || "monthly",
          user_is_premium: profile?.is_premium || false,
          premium_expires: profile?.premium_expires_at || null,
        };
      })
      .sort((a, b) => b.record_date.localeCompare(a.record_date));
  }, [records, premiumRequests, profiles]);

  // Premium stats by plan
  const monthlyCount = premiumDetails.filter(d => d.plan_type === "monthly").length;
  const yearlyCount = premiumDetails.filter(d => d.plan_type === "yearly").length;
  const monthlyTotal = monthlyCount * PLAN_PRICE.monthly;
  const yearlyTotal = yearlyCount * PLAN_PRICE.yearly;

  // Get unique months for filter
  const months = useMemo(() => {
    const set = new Set(records.map(r => r.record_date.slice(0, 7)));
    return [...set].sort().reverse();
  }, [records]);

  // Non-premium records for "Kê khai khác" tab
  const otherRecords = useMemo(() => {
    let result = records.filter(r => r.source_type !== "premium");
    if (filterType !== "all" && filterType !== "premium") result = result.filter(r => r.source_type === filterType);
    if (filterMonth && filterMonth !== "all_months") result = result.filter(r => r.record_date.startsWith(filterMonth));
    return result;
  }, [records, filterType, filterMonth]);

  const otherTotal = otherRecords.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <DollarSign className="w-4.5 h-4.5 text-accent" />
            </div>
            Quản lý doanh thu
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Chi tiết doanh thu từ đăng ký Premium và kê khai thủ công.
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Tổng doanh thu", value: formatVND(totalRevenue), sub: `${records.length} bản ghi`, icon: <TrendingUp className="w-5 h-5" />, accent: true },
          { label: "Premium", value: formatVND(premiumRevenue), sub: `${premiumDetails.length} lượt đăng ký`, icon: <Crown className="w-5 h-5" />, accent: false },
          { label: "Quảng cáo", value: formatVND(adsRevenue), sub: `${records.filter(r => r.source_type === "ads").length} kê khai`, icon: <Megaphone className="w-5 h-5" />, accent: false },
          { label: "Đối tác & Khác", value: formatVND(collabRevenue), sub: `${records.filter(r => r.source_type === "collab" || r.source_type === "other").length} kê khai`, icon: <Handshake className="w-5 h-5" />, accent: false },
        ].map((s, i) => (
          <Card key={i} className={`border-border/60 shadow-none ${s.accent ? "ring-1 ring-accent/20 bg-accent/[0.02]" : ""}`}>
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.accent ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                {s.icon}
              </div>
              <div className="text-xl font-bold tabular-nums tracking-tight">{s.value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="premium" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="premium" className="gap-1.5 text-xs">
            <Crown className="w-3.5 h-3.5" /> Premium ({premiumDetails.length})
          </TabsTrigger>
          <TabsTrigger value="other" className="gap-1.5 text-xs">
            <Package className="w-3.5 h-3.5" /> Kê khai khác ({records.filter(r => r.source_type !== "premium").length})
          </TabsTrigger>
        </TabsList>

        {/* === PREMIUM TAB === */}
        <TabsContent value="premium" className="space-y-4">
          {/* Plan breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-border/60 shadow-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-muted-foreground">Gói 1 Tháng</span>
                </div>
                <div className="text-lg font-bold tabular-nums">{monthlyCount} <span className="text-sm font-normal text-muted-foreground">lượt</span></div>
                <div className="text-xs text-muted-foreground mt-0.5">{formatVND(monthlyTotal)}</div>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="w-4 h-4 text-accent" />
                  <span className="text-xs font-semibold text-muted-foreground">Gói 1 Năm</span>
                </div>
                <div className="text-lg font-bold tabular-nums">{yearlyCount} <span className="text-sm font-normal text-muted-foreground">lượt</span></div>
                <div className="text-xs text-muted-foreground mt-0.5">{formatVND(yearlyTotal)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Premium detail table */}
          {premiumDetails.length > 0 ? (
            <Card className="border-border/60 shadow-none overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Gói</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead>Ngày đăng ký</TableHead>
                    <TableHead className="hidden md:table-cell">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {premiumDetails.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-accent" />
                          </div>
                          <span className="text-sm font-medium">{d.user_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border font-medium ${d.plan_type === "yearly" ? "bg-accent/10 text-accent border-accent/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"}`}>
                          <Crown className="w-3 h-3" />
                          {PLAN_LABEL[d.plan_type] || "1 Tháng"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold text-accent tabular-nums">{formatVND(d.amount)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground tabular-nums">
                        {new Date(d.record_date).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {d.user_is_premium ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20 font-medium">
                            Đang hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border font-medium">
                            Hết hạn
                          </span>
                        )}
                        {d.premium_expires && d.user_is_premium && (
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            HH: {new Date(d.premium_expires).toLocaleDateString("vi-VN")}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card className="border-border/60 shadow-none">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Crown className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Chưa có doanh thu Premium nào.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* === OTHER REVENUE TAB === */}
        <TabsContent value="other" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Select value={filterType === "premium" ? "all" : filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Tất cả nguồn" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nguồn</SelectItem>
                <SelectItem value="ads">Quảng cáo</SelectItem>
                <SelectItem value="collab">Đối tác</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Tất cả tháng" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all_months">Tất cả tháng</SelectItem>
                {months.map(m => (
                  <SelectItem key={m} value={m}>
                    {new Date(m + "-01").toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {otherRecords.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                {otherRecords.length} bản ghi · {formatVND(otherTotal)}
              </span>
            )}
            <Button size="sm" onClick={openNew} className="bg-accent text-accent-foreground h-8 gap-1.5 ml-auto">
              <Plus className="w-3.5 h-3.5" /> Kê khai
            </Button>
          </div>

          {otherRecords.length > 0 ? (
            <Card className="border-border/60 shadow-none overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-28">Nguồn</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead className="w-28">Ngày</TableHead>
                    <TableHead className="hidden md:table-cell">Ghi chú</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherRecords.map((r) => {
                    const st = SOURCE_TYPES[r.source_type] || SOURCE_TYPES.other;
                    return (
                      <TableRow key={r.id} className="group">
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border font-medium ${st.color}`}>
                            {st.icon} {st.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm font-medium max-w-[200px] truncate">{r.source_label}</TableCell>
                        <TableCell className="text-right font-bold text-accent tabular-nums">{formatVND(r.amount)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground tabular-nums">
                          {new Date(r.record_date).toLocaleDateString("vi-VN")}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate hidden md:table-cell">
                          {r.note || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(r)} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(r)} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
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
              <CardContent className="py-12 text-center text-muted-foreground">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Chưa có kê khai doanh thu nào.</p>
                <p className="text-xs mt-1">Nhấn "Kê khai" để thêm doanh thu từ quảng cáo, đối tác...</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {editing ? "Sửa kê khai" : "Kê khai doanh thu"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium">Nguồn doanh thu</Label>
              <Select value={form.source_type} onValueChange={(v) => setForm({ ...form, source_type: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ads">Quảng cáo</SelectItem>
                  <SelectItem value="collab">Đối tác / Collab</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium">Mô tả</Label>
              <Input value={form.source_label} onChange={(e) => setForm({ ...form, source_label: e.target.value })} placeholder="VD: Google Ads T1/2026, Đối tác ABC..." maxLength={200} className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium">Số tiền (VNĐ)</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) || 0 })} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-xs font-medium">Ngày ghi nhận</Label>
                <Input type="date" value={form.record_date} onChange={(e) => setForm({ ...form, record_date: e.target.value })} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium">Ghi chú (tùy chọn)</Label>
              <Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Chi tiết hợp đồng, điều khoản..." maxLength={500} className="mt-1.5 resize-none" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>Hủy</Button>
            <Button onClick={saveRecord} disabled={processing} className="bg-accent text-accent-foreground">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bản ghi doanh thu?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa "{deleteTarget?.source_label}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RevenueTab;
