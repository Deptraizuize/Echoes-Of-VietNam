import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import UserHeader from "@/components/layout/UserHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import {
  User, Camera, Save, Lock, Eye, EyeOff, Link2, ArrowLeft, CheckCircle2, AtSign, Trash2, AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

const Settings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshProfile, signOut } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Google link
  const [hasGoogle, setHasGoogle] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }

    // Check identities for Google
    const googleIdentity = user.identities?.find((i) => i.provider === "google");
    setHasGoogle(!!googleIdentity);

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, username")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url);
        setUsername(data.username || "");
      }
    };
    fetchProfile();
  }, [user, authLoading, navigate]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Ảnh quá lớn", description: "Vui lòng chọn ảnh dưới 2MB", variant: "destructive" });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({ title: "Sai định dạng", description: "Vui lòng chọn file ảnh", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      await supabase.from("profiles").update({ avatar_url: newUrl }).eq("user_id", user.id);
      setAvatarUrl(newUrl);
      toast({ title: "Đã cập nhật ảnh đại diện!" });
    } catch (err: any) {
      toast({ title: "Lỗi tải ảnh", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const trimmed = displayName.trim();
    if (!trimmed || trimmed.length > 100) {
      toast({ title: "Tên không hợp lệ", description: "Tên phải từ 1–100 ký tự", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: trimmed }).eq("user_id", user.id);
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Đã lưu tên hiển thị!" });
      await refreshProfile();
    }
    setSaving(false);
  };

  const handleSaveUsername = async () => {
    if (!user) return;
    const trimmed = username.trim().toLowerCase();
    if (!trimmed || trimmed.length < 3 || trimmed.length > 30) {
      toast({ title: "Tên đăng nhập không hợp lệ", description: "Cần từ 3–30 ký tự", variant: "destructive" });
      return;
    }
    if (!/^[a-z0-9._]+$/.test(trimmed)) {
      toast({ title: "Tên đăng nhập không hợp lệ", description: "Chỉ chứa chữ thường, số, dấu chấm và gạch dưới", variant: "destructive" });
      return;
    }
    setSavingUsername(true);
    const { error } = await supabase.from("profiles").update({ username: trimmed }).eq("user_id", user.id);
    if (error) {
      if (error.message.includes("unique") || error.message.includes("duplicate")) {
        toast({ title: "Tên đăng nhập đã tồn tại", description: "Vui lòng chọn tên khác", variant: "destructive" });
      } else {
        toast({ title: "Lỗi", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: "Đã lưu tên đăng nhập!" });
      setUsername(trimmed);
    }
    setSavingUsername(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast({ title: "Vui lòng nhập mật khẩu hiện tại", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Mật khẩu mới quá ngắn", description: "Tối thiểu 6 ký tự", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Mật khẩu mới không khớp", variant: "destructive" });
      return;
    }
    if (currentPassword === newPassword) {
      toast({ title: "Mật khẩu mới phải khác mật khẩu cũ", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    try {
      // Verify current password by re-signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user!.email!,
        password: currentPassword,
      });
      if (signInError) {
        toast({ title: "Mật khẩu hiện tại không đúng", description: "Vui lòng kiểm tra lại.", variant: "destructive" });
        setChangingPassword(false);
        return;
      }
      // Update to new password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast({ title: "Lỗi đổi mật khẩu", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Đã đổi mật khẩu thành công!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" });
    }
    setChangingPassword(false);
  };

  const handleLinkGoogle = async () => {
    setLinkingGoogle(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (err: any) {
      toast({ title: "Lỗi liên kết Google", description: err.message, variant: "destructive" });
      setLinkingGoogle(false);
    }
  };

  const isEmailUser = user?.app_metadata?.provider === "email";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UserHeader />

      <div className="container mx-auto px-6 md:px-12 py-8 max-w-2xl">
        <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="mb-6 text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại hồ sơ
        </Button>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold mb-8"
        >
          Cài đặt tài khoản
        </motion.h1>

        <div className="space-y-8">
          {/* Avatar */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-6 rounded-xl border border-border bg-card"
          >
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4 text-accent" /> Ảnh đại diện
            </h2>
            <div className="flex items-center gap-5">
              <Avatar className="w-20 h-20 border-2 border-border">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Avatar" />
                ) : null}
                <AvatarFallback className="bg-accent/10 text-accent text-xl">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Đang tải..." : "Chọn ảnh"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG — tối đa 2MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
            </div>
          </motion.section>

          {/* Display name */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl border border-border bg-card"
          >
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-accent" /> Tên hiển thị
            </h2>
            <div className="flex gap-3">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nhập tên hiển thị"
                maxLength={100}
                className="flex-1"
              />
              <Button onClick={handleSaveProfile} disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Save className="w-4 h-4 mr-1" /> {saving ? "..." : "Lưu"}
              </Button>
            </div>
          </motion.section>

          {/* Username */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="p-6 rounded-xl border border-border bg-card"
          >
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <AtSign className="w-4 h-4 text-accent" /> Tên đăng nhập
            </h2>
            <div className="flex gap-3">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
                placeholder="nguoiyeusu123"
                maxLength={30}
                className="flex-1"
              />
              <Button onClick={handleSaveUsername} disabled={savingUsername} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Save className="w-4 h-4 mr-1" /> {savingUsername ? "..." : "Lưu"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Chữ thường, số, dấu chấm, gạch dưới. 3–30 ký tự. Dùng để đăng nhập.</p>
          </motion.section>

          {/* Password */}
          {isEmailUser && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-6 rounded-xl border border-border bg-card"
            >
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-accent" /> Đổi mật khẩu
              </h2>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="current-pass" className="text-sm text-muted-foreground">Mật khẩu hiện tại</Label>
                  <div className="relative mt-1">
                    <Input
                      id="current-pass"
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="new-pass" className="text-sm text-muted-foreground">Mật khẩu mới</Label>
                  <div className="relative mt-1">
                    <Input
                      id="new-pass"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      minLength={6}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm-pass" className="text-sm text-muted-foreground">Xác nhận mật khẩu</Label>
                  <Input
                    id="confirm-pass"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword || !currentPassword || !newPassword}
                  variant="outline"
                  className="mt-1"
                >
                  {changingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                </Button>
              </div>
            </motion.section>
          )}

          {/* Google linking */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl border border-border bg-card"
          >
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-accent" /> Liên kết tài khoản
            </h2>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-sm font-medium">Google</span>
              </div>
              {hasGoogle ? (
                <span className="flex items-center gap-1 text-xs text-accent font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã liên kết
                </span>
              ) : (
                <Button size="sm" variant="outline" onClick={handleLinkGoogle} disabled={linkingGoogle}>
                  {linkingGoogle ? "Đang liên kết..." : "Liên kết"}
                </Button>
              )}
            </div>
            {!hasGoogle && (
              <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
                <span className="text-accent mt-0.5">⚠</span>
                Lưu ý: Tài khoản Google phải có cùng email <strong className="text-foreground">{user?.email}</strong> để liên kết thành công. Nếu email Google khác, hệ thống sẽ tạo tài khoản mới thay vì liên kết.
              </p>
            )}
          </motion.section>

          {/* Email info */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-6 rounded-xl border border-border bg-card"
          >
            <h2 className="text-base font-semibold mb-3">Email đăng nhập</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </motion.section>

          {/* Delete Account */}
          <DeleteAccountSection user={user} signOut={signOut} navigate={navigate} />
        </div>
      </div>
    </div>
  );
};

const DeleteAccountSection = ({ user, signOut, navigate }: { user: any; signOut: () => Promise<void>; navigate: (path: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDelete = async () => {
    if (confirmText !== "XÓA TÀI KHOẢN") return;
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ target_user_id: user.id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Lỗi xóa tài khoản");
      await signOut();
      navigate("/");
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" });
      setDeleting(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="p-6 rounded-xl border border-destructive/30 bg-destructive/5"
    >
      <h2 className="text-base font-semibold mb-2 flex items-center gap-2 text-destructive">
        <AlertTriangle className="w-4 h-4" /> Vùng nguy hiểm
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Xóa tài khoản sẽ xóa vĩnh viễn toàn bộ dữ liệu: hồ sơ, tiến trình, điểm thưởng và huy hiệu. Hành động này không thể hoàn tác.
      </p>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="w-4 h-4 mr-1" /> Xóa tài khoản
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Xác nhận xóa tài khoản
            </DialogTitle>
            <DialogDescription>
              Toàn bộ dữ liệu sẽ bị xóa vĩnh viễn. Nhập <strong className="text-foreground">XÓA TÀI KHOẢN</strong> để xác nhận.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Nhập XÓA TÀI KHOẢN"
            className="mt-2"
          />
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={deleting}>Hủy</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmText !== "XÓA TÀI KHOẢN" || deleting}
            >
              {deleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.section>
  );
};

export default Settings;
