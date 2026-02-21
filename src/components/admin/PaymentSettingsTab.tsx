import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, QrCode, CreditCard, X, Info } from "lucide-react";

interface PaymentSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string | null;
  is_active: boolean;
}

interface Props {
  settings: PaymentSetting[];
  onRefresh: () => void;
}

const PaymentSettingsTab = ({ settings, onRefresh }: Props) => {
  const { toast } = useToast();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (s: PaymentSetting) => {
    setEditingKey(s.setting_key);
    setEditValue(s.setting_value);
  };

  const cancelEdit = () => setEditingKey(null);

  const saveEdit = async (s: PaymentSetting) => {
    const { error } = await supabase
      .from("payment_settings")
      .update({ setting_value: editValue })
      .eq("id", s.id);
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Đã lưu!" });
    setEditingKey(null);
    onRefresh();
  };

  const qrSetting = settings.find(s => s.setting_key === "qr_image_url");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
          <CreditCard className="w-5 h-5 text-accent" /> Cài đặt thanh toán
        </h3>
        <p className="text-sm text-muted-foreground">Quản lý thông tin chuyển khoản hiển thị trên trang Nâng cấp Premium.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Preview */}
        {qrSetting?.setting_value && (
          <Card className="border-border/60 shadow-none lg:col-span-1">
            <CardContent className="p-6 flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-accent" />
              </div>
              <img
                src={qrSetting.setting_value}
                alt="QR Thanh toán"
                className="w-44 h-44 object-contain rounded-xl border border-border bg-background p-2"
              />
              <p className="text-xs text-muted-foreground text-center">Mã QR hiển thị trên trang nâng cấp</p>
            </CardContent>
          </Card>
        )}

        {/* Settings Table */}
        <Card className={`border-border/60 shadow-none overflow-hidden ${qrSetting?.setting_value ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-40">Mục cài đặt</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <span className="text-sm font-medium">{s.description || s.setting_key}</span>
                  </TableCell>
                  <TableCell>
                    {editingKey === s.setting_key ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-9"
                        placeholder={s.setting_key === "qr_image_url" ? "https://... URL ảnh QR" : "Nhập giá trị..."}
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {s.setting_value || <span className="italic text-muted-foreground/50">Chưa thiết lập</span>}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingKey === s.setting_key ? (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => saveEdit(s)} className="h-8 w-8 text-accent hover:text-accent">
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={cancelEdit} className="h-8 w-8 text-muted-foreground">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => startEdit(s)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 border border-border/40">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-accent/60" />
        <span>Thông tin trên sẽ hiển thị trên trang Nâng cấp Premium để hướng dẫn người dùng chuyển khoản.</span>
      </div>
    </div>
  );
};

export default PaymentSettingsTab;
