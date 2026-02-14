import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, QrCode } from "lucide-react";

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
      <h3 className="font-serif text-xl">Thông tin thanh toán</h3>

      {/* QR Preview */}
      {qrSetting?.setting_value && (
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center gap-4">
          <QrCode className="w-6 h-6 text-accent" />
          <img
            src={qrSetting.setting_value}
            alt="QR Thanh toán"
            className="w-48 h-48 object-contain rounded-lg border border-border"
          />
          <p className="text-sm text-muted-foreground">Mã QR hiển thị trên trang nâng cấp</p>
        </div>
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">Mục</TableHead>
              <TableHead>Giá trị</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settings.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="text-sm font-medium">{s.description || s.setting_key}</TableCell>
                <TableCell>
                  {editingKey === s.setting_key ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="h-8"
                      placeholder={s.setting_key === "qr_image_url" ? "https://... URL ảnh QR" : ""}
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {s.setting_value || <span className="italic">Chưa thiết lập</span>}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {editingKey === s.setting_key ? (
                    <Button variant="ghost" size="icon" onClick={() => saveEdit(s)} className="h-8 w-8 text-accent">
                      <Save className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => startEdit(s)} className="h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        💡 Thông tin này sẽ hiển thị trên trang Nâng cấp Premium để người dùng chuyển khoản.
      </p>
    </div>
  );
};

export default PaymentSettingsTab;
