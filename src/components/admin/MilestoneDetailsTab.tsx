import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, Search, Trash2, ExternalLink, Link, X } from "lucide-react";
import { cn } from "@/lib/utils";
import MarkdownEditor from "./MarkdownEditor";

interface MilestoneRow {
  id: string;
  title: string;
  period_title: string;
  phase_title: string;
}

interface MilestoneDetailRow {
  id: string;
  milestone_id: string;
  title: string;
  summary: string | null;
  events: string | null;
  results: string | null;
  significance: string | null;
  hero_names: string[] | null;
  landmark_names: string[] | null;
  hero_urls: string[] | null;
  landmark_urls: string[] | null;
  image_urls: string[] | null;
  image_captions: string[] | null;
  source_references: string | null;
}

interface Props {
  milestones: MilestoneRow[];
  details: MilestoneDetailRow[];
  onRefresh: () => void;
}

interface LinkedItem {
  name: string;
  url: string;
}

const MilestoneDetailsTab = ({ milestones, details, onRefresh }: Props) => {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<MilestoneDetailRow | null>(null);
  const [filterMilestone, setFilterMilestone] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MilestoneDetailRow | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "links" | "media">("content");
  const [form, setForm] = useState({
    milestone_id: "",
    title: "",
    summary: "",
    events: "",
    results: "",
    significance: "",
    image_urls: "",
    image_captions: [] as string[],
    source_references: "",
  });
  const [heroes, setHeroes] = useState<LinkedItem[]>([]);
  const [landmarks, setLandmarks] = useState<LinkedItem[]>([]);

  const filteredDetails = useMemo(() => {
    return details.filter((d) => {
      if (filterMilestone && d.milestone_id !== filterMilestone) return false;
      if (searchQuery && !d.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [details, filterMilestone, searchQuery]);

  const milestonesWithoutDetails = useMemo(() => {
    const detailedIds = new Set(details.map(d => d.milestone_id));
    return milestones.filter(m => !detailedIds.has(m.id));
  }, [milestones, details]);

  const parseLinkedItems = (names: string[] | null, urls: string[] | null): LinkedItem[] => {
    if (!names) return [];
    return names.map((name, i) => ({
      name,
      url: urls?.[i] || `https://vi.wikipedia.org/wiki/${encodeURIComponent(name.replace(/ /g, "_"))}`,
    }));
  };

  const getImageUrls = () => form.image_urls ? form.image_urls.split("\n").map(s => s.trim()).filter(Boolean) : [];

  const syncCaptions = (urls: string[]) => {
    const captions = [...form.image_captions];
    while (captions.length < urls.length) captions.push("");
    return captions.slice(0, urls.length);
  };

  const openEdit = (d: MilestoneDetailRow) => {
    setEditing(d);
    setForm({
      milestone_id: d.milestone_id,
      title: d.title,
      summary: d.summary || "",
      events: d.events || "",
      results: d.results || "",
      significance: d.significance || "",
      image_urls: d.image_urls?.join("\n") || "",
      image_captions: d.image_captions || [],
      source_references: d.source_references || "",
    });
    setHeroes(parseLinkedItems(d.hero_names, d.hero_urls));
    setLandmarks(parseLinkedItems(d.landmark_names, d.landmark_urls));
    setActiveTab("content");
    setShowDialog(true);
  };

  const openNew = () => {
    setEditing(null);
    const defaultMilestone = filterMilestone || milestonesWithoutDetails[0]?.id || milestones[0]?.id || "";
    setForm({
      milestone_id: defaultMilestone,
      title: "",
      summary: "",
      events: "",
      results: "",
      significance: "",
      image_urls: "",
      image_captions: [],
      source_references: "",
    });
    setHeroes([]);
    setLandmarks([]);
    setActiveTab("content");
    setShowDialog(true);
  };

  const save = async () => {
    if (!form.milestone_id || !form.title) {
      toast({ title: "Lỗi", description: "Cần chọn cột mốc và nhập tiêu đề", variant: "destructive" });
      return;
    }

    const imageUrlsList = getImageUrls();
    const captions = syncCaptions(imageUrlsList);

    const payload: any = {
      milestone_id: form.milestone_id,
      title: form.title,
      summary: form.summary || null,
      events: form.events || null,
      results: form.results || null,
      significance: form.significance || null,
      hero_names: heroes.length > 0 ? heroes.map(h => h.name) : null,
      hero_urls: heroes.length > 0 ? heroes.map(h => h.url) : null,
      landmark_names: landmarks.length > 0 ? landmarks.map(l => l.name) : null,
      landmark_urls: landmarks.length > 0 ? landmarks.map(l => l.url) : null,
      image_urls: imageUrlsList.length > 0 ? imageUrlsList : null,
      image_captions: captions.some(c => c.trim()) ? captions : null,
      source_references: form.source_references || null,
    };

    if (editing) {
      const { error } = await supabase.from("milestone_details").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("milestone_details").insert(payload);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); return; }
    }

    toast({ title: "Thành công!", description: "Nội dung đã được lưu." });
    setShowDialog(false);
    onRefresh();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("milestone_details").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Đã xóa bài viết." });
      onRefresh();
    }
    setDeleteTarget(null);
  };

  const getMilestoneTitle = (id: string) => milestones.find(m => m.id === id)?.title || id;

  const getCompleteness = (d: MilestoneDetailRow) => {
    let filled = 0;
    const total = 4;
    if (d.events) filled++;
    if (d.results) filled++;
    if (d.significance) filled++;
    if (d.summary) filled++;
    return { filled, total };
  };

  const addLinkedItem = (list: LinkedItem[], setList: (v: LinkedItem[]) => void) => {
    setList([...list, { name: "", url: "" }]);
  };

  const updateLinkedItem = (list: LinkedItem[], setList: (v: LinkedItem[]) => void, index: number, field: "name" | "url", value: string) => {
    const updated = [...list];
    updated[index] = { ...updated[index], [field]: value };
    setList(updated);
  };

  const removeLinkedItem = (list: LinkedItem[], setList: (v: LinkedItem[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const LinkedItemsEditor = ({ items, setItems, label, placeholder }: { items: LinkedItem[]; setItems: (v: LinkedItem[]) => void; label: string; placeholder: string }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label} ({items.length})</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => addLinkedItem(items, setItems)} className="h-7 text-xs gap-1">
          <Plus className="w-3 h-3" /> Thêm
        </Button>
      </div>
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground py-3 text-center border border-dashed border-border rounded-lg">
          Chưa có mục nào. Nhấn "Thêm" để bắt đầu.
        </p>
      )}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-lg p-2">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Input
                value={item.name}
                onChange={(e) => updateLinkedItem(items, setItems, i, "name", e.target.value)}
                placeholder={placeholder}
                className="h-8 text-sm"
              />
              <div className="flex items-center gap-1">
                <Link className="w-3 h-3 text-muted-foreground shrink-0" />
                <Input
                  value={item.url}
                  onChange={(e) => updateLinkedItem(items, setItems, i, "url", e.target.value)}
                  placeholder="https://vi.wikipedia.org/wiki/..."
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeLinkedItem(items, setItems, i)} className="h-7 w-7 shrink-0 text-destructive hover:text-destructive">
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground">
        Để trống URL sẽ tự động link đến Wikipedia tiếng Việt
      </p>
    </div>
  );

  const tabs = [
    { id: "content" as const, label: "Nội dung", count: null },
    { id: "links" as const, label: "Liên kết", count: heroes.length + landmarks.length },
    { id: "media" as const, label: "Hình ảnh", count: getImageUrls().length },
  ];

  const imageUrls = getImageUrls();
  const captions = syncCaptions(imageUrls);

  return (
    <>
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-xl">Nội dung chi tiết ({details.length})</h3>
          <div className="flex items-center gap-2">
            {milestonesWithoutDetails.length > 0 && (
              <span className="text-xs text-muted-foreground hidden sm:block">
                {milestonesWithoutDetails.length} cột mốc chưa có bài viết
              </span>
            )}
            <Button size="sm" onClick={openNew} className="bg-accent text-accent-foreground">
              <Plus className="w-4 h-4 mr-2" /> Thêm
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm tiêu đề..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-9 text-sm" />
          </div>
          <select value={filterMilestone} onChange={(e) => setFilterMilestone(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[150px]">
            <option value="">Tất cả cột mốc</option>
            {milestones.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>

        {filteredDetails.length !== details.length && (
          <p className="text-xs text-muted-foreground">Hiển thị {filteredDetails.length}/{details.length} bài viết</p>
        )}
      </div>

      <div className="border border-border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px] w-[120px]">Cột mốc</TableHead>
              <TableHead className="min-w-[200px]">Tiêu đề</TableHead>
              <TableHead className="w-20 text-center">Nội dung</TableHead>
              <TableHead className="w-16 text-center">NV</TableHead>
              <TableHead className="w-16 text-center">DT</TableHead>
              <TableHead className="w-16 text-center">Ảnh</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDetails.map((d) => {
              const { filled, total } = getCompleteness(d);
              return (
                <TableRow key={d.id}>
                  <TableCell><span className="line-clamp-1 text-xs text-muted-foreground">{getMilestoneTitle(d.milestone_id)}</span></TableCell>
                  <TableCell><span className="line-clamp-2 text-sm leading-snug">{d.title}</span></TableCell>
                  <TableCell className="text-center">
                    <span className={`text-xs font-medium ${filled === total ? "text-green-500" : filled >= 2 ? "text-accent" : "text-destructive"}`}>{filled}/{total}</span>
                  </TableCell>
                  <TableCell className="text-center text-xs text-muted-foreground">{d.hero_names?.length || 0}</TableCell>
                  <TableCell className="text-center text-xs text-muted-foreground">{d.landmark_names?.length || 0}</TableCell>
                  <TableCell className="text-center">
                    {d.image_urls && d.image_urls.length > 0 ? <span className="text-xs text-accent font-medium">{d.image_urls.length}</span> : <span className="text-xs text-muted-foreground/50">—</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(d)} className="h-8 w-8"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(d)} className="h-8 w-8 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredDetails.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {details.length === 0 ? "Chưa có nội dung chi tiết nào" : "Không tìm thấy bài viết phù hợp"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Full-width Edit Dialog with tabs */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[92vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-border shrink-0">
            <DialogTitle className="font-serif text-xl flex items-center gap-3">
              {editing ? "Sửa nội dung chi tiết" : "Thêm nội dung chi tiết"}
              {editing && (
                <a href={`/milestone/${editing.milestone_id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline flex items-center gap-1 font-normal">
                  Xem trang <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </DialogTitle>
            {/* Tabs */}
            <div className="flex gap-1 mt-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-accent/10 text-accent font-medium border-b-2 border-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && tab.count > 0 && (
                    <span className="ml-1.5 bg-accent/20 text-accent text-[10px] px-1.5 py-0.5 rounded-full">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {activeTab === "content" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Cột mốc</Label>
                    <select value={form.milestone_id} onChange={(e) => setForm({ ...form, milestone_id: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" disabled={!!editing}>
                      {milestones.map((m) => (<option key={m.id} value={m.id}>{m.title}</option>))}
                    </select>
                  </div>
                  <div>
                    <Label>Tiêu đề</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </div>
                </div>

                <MarkdownEditor label="Tóm tắt" value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} rows={2} placeholder="Tóm tắt ngắn gọn..." websitePreview />
                <MarkdownEditor label="Diễn biến" value={form.events} onChange={(v) => setForm({ ...form, events: v })} rows={12} placeholder="## Giai đoạn 1&#10;Nội dung..." splitView websitePreview />
                <MarkdownEditor label="Kết quả" value={form.results} onChange={(v) => setForm({ ...form, results: v })} rows={8} placeholder="- Kết quả 1&#10;- Kết quả 2" splitView websitePreview />
                <MarkdownEditor label="Ý nghĩa lịch sử" value={form.significance} onChange={(v) => setForm({ ...form, significance: v })} rows={8} placeholder="**Ý nghĩa quan trọng**: ..." splitView websitePreview />

                <div className="border-t border-border pt-5">
                  <MarkdownEditor
                    label="Nguồn tham khảo"
                    value={form.source_references}
                    onChange={(v) => setForm({ ...form, source_references: v })}
                    rows={6}
                    placeholder={"1. Đại Việt Sử Ký Toàn Thư\n2. [Wikipedia](https://vi.wikipedia.org/wiki/...)\n3. Viện Sử học Việt Nam"}
                    splitView
                    websitePreview
                  />
                </div>
              </div>
            )}

            {activeTab === "links" && (
              <div className="space-y-8">
                <LinkedItemsEditor items={heroes} setItems={setHeroes} label="Nhân vật lịch sử" placeholder="Trần Hưng Đạo" />
                <div className="border-t border-border" />
                <LinkedItemsEditor items={landmarks} setItems={setLandmarks} label="Di tích liên quan" placeholder="Bạch Đằng" />
              </div>
            )}

            {activeTab === "media" && (
              <div className="space-y-5">
                {/* URL Input */}
                <div>
                  <Label>URL hình ảnh (mỗi dòng 1 URL)</Label>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">Ảnh đầu tiên sẽ làm ảnh bìa (hero). Các ảnh còn lại hiển thị trong gallery.</p>
                  <textarea
                    value={form.image_urls}
                    onChange={(e) => {
                      const newUrls = e.target.value;
                      const newUrlList = newUrls.split("\n").map(s => s.trim()).filter(Boolean);
                      const newCaptions = syncCaptions(newUrlList);
                      setForm({ ...form, image_urls: newUrls, image_captions: newCaptions });
                    }}
                    rows={4}
                    placeholder={"https://example.com/hero-image.jpg\nhttps://example.com/image2.jpg"}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                  />
                </div>

                {/* Hero image preview */}
                {imageUrls.length > 0 && (
                  <div className="space-y-4">
                    {/* Hero card - larger */}
                    <div className="relative rounded-xl overflow-hidden border-2 border-accent/30 bg-card group">
                      <div className="flex gap-4 p-3">
                        <div className="relative shrink-0 w-40 h-28 rounded-lg overflow-hidden border border-border">
                          <img src={imageUrls[0]} alt="Ảnh bìa" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          <div className="absolute top-1.5 left-1.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-accent text-accent-foreground shadow-sm">★ Ảnh bìa</span>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-2 min-w-0">
                          <Input
                            value={captions[0] || ""}
                            onChange={(e) => {
                              const newCaptions = [...captions];
                              newCaptions[0] = e.target.value;
                              setForm({ ...form, image_captions: newCaptions });
                            }}
                            placeholder="Chú thích ảnh bìa (tùy chọn)"
                            className="h-8 text-sm"
                          />
                          <p className="text-[10px] text-muted-foreground truncate font-mono">{imageUrls[0]}</p>
                        </div>
                        <button type="button" onClick={() => {
                          const lines = form.image_urls.split("\n"); lines.splice(0, 1);
                          const newCaps = [...captions]; newCaps.splice(0, 1);
                          setForm({ ...form, image_urls: lines.join("\n"), image_captions: newCaps });
                        }} className="shrink-0 w-7 h-7 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors text-xs self-start">✕</button>
                      </div>
                    </div>

                    {/* Gallery grid - compact cards */}
                    {imageUrls.length > 1 && (
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Gallery ({imageUrls.length - 1} ảnh)</Label>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                          {imageUrls.slice(1).map((url, idx) => {
                            const i = idx + 1;
                            return (
                              <div key={i} className="relative rounded-lg overflow-hidden border border-border bg-card group hover:border-accent/30 transition-colors">
                                <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                                  <img src={url} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                  <div className="absolute top-1.5 left-1.5">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-foreground/60 text-primary-foreground">#{i + 1}</span>
                                  </div>
                                  <button type="button" onClick={() => {
                                    const lines = form.image_urls.split("\n"); lines.splice(i, 1);
                                    const newCaps = [...captions]; newCaps.splice(i, 1);
                                    setForm({ ...form, image_urls: lines.join("\n"), image_captions: newCaps });
                                  }} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-destructive/80 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">✕</button>
                                </div>
                                <div className="p-2">
                                  <Input
                                    value={captions[i] || ""}
                                    onChange={(e) => {
                                      const newCaptions = [...captions];
                                      newCaptions[i] = e.target.value;
                                      setForm({ ...form, image_captions: newCaptions });
                                    }}
                                    placeholder={`Chú thích #${i + 1}`}
                                    className="h-7 text-xs border-0 bg-transparent px-1 focus-visible:ring-1"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border shrink-0">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Hủy</Button>
            <Button onClick={save} className="bg-accent text-accent-foreground">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc muốn xóa bài viết "{deleteTarget?.title}"? Toàn bộ nội dung sẽ bị xóa vĩnh viễn.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MilestoneDetailsTab;
