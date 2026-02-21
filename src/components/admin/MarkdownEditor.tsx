import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Eye, Edit3, Columns, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  label?: string;
  splitView?: boolean;
}

const MarkdownEditor = ({ value, onChange, rows = 4, placeholder, label, splitView = false }: Props) => {
  const [mode, setMode] = useState<"edit" | "preview" | "split">(splitView ? "split" : "edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && mode !== "preview") {
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = Math.max(el.scrollHeight, rows * 24) + "px";
    }
  }, [value, mode, rows]);

  const insertMarkdown = (before: string, after: string = "") => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.substring(start, end);
    const newValue = value.substring(0, start) + before + selected + after + value.substring(end);
    onChange(newValue);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const toolbar = (
    <div className="flex items-center gap-1 flex-wrap">
      <button type="button" onClick={() => insertMarkdown("**", "**")} className="px-2 py-1 text-xs font-bold rounded hover:bg-muted transition-colors" title="In đậm">B</button>
      <button type="button" onClick={() => insertMarkdown("*", "*")} className="px-2 py-1 text-xs italic rounded hover:bg-muted transition-colors" title="In nghiêng">I</button>
      <button type="button" onClick={() => insertMarkdown("\n## ", "\n")} className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors" title="Tiêu đề">H2</button>
      <button type="button" onClick={() => insertMarkdown("\n### ", "\n")} className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors" title="Tiêu đề nhỏ">H3</button>
      <button type="button" onClick={() => insertMarkdown("\n- ")} className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors" title="Danh sách">• List</button>
      <button type="button" onClick={() => insertMarkdown("[", "](url)")} className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors text-accent" title="Liên kết">🔗</button>
      <button type="button" onClick={() => insertMarkdown("![mô tả](", ")")} className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors" title="Hình ảnh"><ImageIcon className="w-3 h-3 inline" /></button>
      <div className="w-px h-4 bg-border mx-1" />
      <button type="button" onClick={() => insertMarkdown("\n> ")} className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors" title="Trích dẫn">❝</button>
    </div>
  );

  const markdownComponents = {
    img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
      <img
        src={src}
        alt={alt || ""}
        className="rounded-lg border border-border max-w-full h-auto my-3"
        style={{ maxHeight: "300px", objectFit: "contain" }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
        {...props}
      />
    ),
    a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline" {...props}>
        {children}
      </a>
    ),
  };

  const previewContent = (
    <div className={cn(
      "rounded-md border border-input bg-background px-4 py-3 text-sm prose prose-sm max-w-none dark:prose-invert",
      "prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground",
      "prose-a:text-accent prose-a:no-underline hover:prose-a:underline",
      "prose-img:rounded-lg prose-img:border prose-img:border-border",
      "overflow-y-auto",
      mode === "split" ? "h-full min-h-[200px]" : "min-h-[100px]"
    )}>
      {value ? (
        <ReactMarkdown components={markdownComponents}>{value}</ReactMarkdown>
      ) : (
        <p className="text-muted-foreground italic">Chưa có nội dung</p>
      )}
    </div>
  );

  const editorContent = (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className={cn(
        "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none",
        mode === "split" ? "h-full min-h-[200px]" : ""
      )}
    />
  );

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{label}</span>
          <div className="flex items-center gap-1">
            <Button type="button" variant={mode === "edit" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("edit")} className="h-7 text-xs gap-1">
              <Edit3 className="w-3 h-3" /> Soạn
            </Button>
            <Button type="button" variant={mode === "split" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("split")} className="h-7 text-xs gap-1">
              <Columns className="w-3 h-3" /> Song song
            </Button>
            <Button type="button" variant={mode === "preview" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("preview")} className="h-7 text-xs gap-1">
              <Eye className="w-3 h-3" /> Xem
            </Button>
          </div>
        </div>
      )}

      {mode === "edit" && (
        <div className="space-y-1">
          {toolbar}
          {editorContent}
        </div>
      )}

      {mode === "preview" && previewContent}

      {mode === "split" && (
        <div className="space-y-1">
          {toolbar}
          <div className="grid grid-cols-2 gap-3 min-h-[200px]">
            <div className="flex flex-col">{editorContent}</div>
            <div className="flex flex-col">
              <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Xem trước</div>
              {previewContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;
