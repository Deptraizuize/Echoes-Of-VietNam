import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Eye, Edit3, Bold, Italic, Heading2, Heading3, List, Link as LinkIcon, Image as ImageIcon, Quote, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  label?: string;
  splitView?: boolean;
  /** When true, renders preview matching the actual website style */
  websitePreview?: boolean;
}

const MarkdownEditor = ({ value, onChange, rows = 4, placeholder, label, splitView = false, websitePreview = false }: Props) => {
  const [mode, setMode] = useState<"edit" | "preview" | "split">(splitView ? "split" : "edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && mode !== "preview") {
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = Math.max(el.scrollHeight, rows * 28) + "px";
    }
  }, [value, mode, rows]);

  // Sync scroll between editor and preview in split mode
  const handleEditorScroll = useCallback(() => {
    if (mode !== "split" || !textareaRef.current || !previewRef.current) return;
    const editor = textareaRef.current;
    const ratio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
    const preview = previewRef.current;
    preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);
  }, [mode]);

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

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown("**", "**"), title: "In đậm (Ctrl+B)", label: "B" },
    { icon: Italic, action: () => insertMarkdown("*", "*"), title: "In nghiêng (Ctrl+I)", label: "I" },
    { divider: true },
    { icon: Heading2, action: () => insertMarkdown("\n## ", "\n"), title: "Tiêu đề H2" },
    { icon: Heading3, action: () => insertMarkdown("\n### ", "\n"), title: "Tiêu đề H3" },
    { divider: true },
    { icon: List, action: () => insertMarkdown("\n- "), title: "Danh sách" },
    { icon: Quote, action: () => insertMarkdown("\n> "), title: "Trích dẫn" },
    { divider: true },
    { icon: LinkIcon, action: () => insertMarkdown("[", "](url)"), title: "Liên kết" },
    { icon: ImageIcon, action: () => insertMarkdown("![mô tả](", ")"), title: "Hình ảnh" },
  ];

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b") { e.preventDefault(); insertMarkdown("**", "**"); }
      if (e.key === "i") { e.preventDefault(); insertMarkdown("*", "*"); }
    }
    // Tab to indent
    if (e.key === "Tab") {
      e.preventDefault();
      insertMarkdown("  ");
    }
  };

  const markdownComponents = {
    img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
      <img
        src={src}
        alt={alt || ""}
        className="rounded-lg border border-border max-w-full h-auto my-3"
        style={{ maxHeight: "400px", objectFit: "contain" }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        {...props}
      />
    ),
    a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline" {...props}>
        {children}
      </a>
    ),
  };

  // Website-style preview matching MilestoneDetail page
  const websiteMarkdownComponents = {
    ...markdownComponents,
    h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 className="text-xl font-bold text-foreground mt-6 mb-3" {...props}>{children}</h2>
    ),
    h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h3 className="text-lg font-semibold text-foreground mt-4 mb-2" {...props}>{children}</h3>
    ),
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className="text-muted-foreground leading-relaxed text-base mb-3" {...props}>{children}</p>
    ),
    ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
      <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground mb-4" {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
      <ol className="list-decimal pl-6 space-y-1.5 text-muted-foreground mb-4" {...props}>{children}</ol>
    ),
    li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
      <li className="text-muted-foreground leading-relaxed" {...props}>{children}</li>
    ),
    blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
      <blockquote className="border-l-3 border-accent/40 pl-4 py-1 my-4 italic text-muted-foreground/80" {...props}>{children}</blockquote>
    ),
    strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <strong className="text-foreground font-semibold" {...props}>{children}</strong>
    ),
    img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
      <img
        src={src}
        alt={alt || ""}
        className="rounded-xl border border-border max-w-full h-auto my-4 shadow-sm"
        style={{ maxHeight: "400px", objectFit: "contain" }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        {...props}
      />
    ),
  };

  const renderPreview = (className?: string) => {
    const components = websitePreview ? websiteMarkdownComponents : markdownComponents;
    const baseClass = websitePreview
      ? "bg-background px-5 py-4 text-sm leading-relaxed"
      : "prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:border prose-img:border-border px-4 py-3 text-sm";

    return (
      <div
        ref={previewRef}
        className={cn(
          "rounded-md border border-input overflow-y-auto",
          baseClass,
          className
        )}
      >
        {websitePreview && (
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-border">
            <Monitor className="w-3.5 h-3.5 text-accent" />
            <span className="text-[10px] uppercase tracking-widest text-accent font-medium">Xem trước giao diện thực tế</span>
          </div>
        )}
        {value ? (
          <ReactMarkdown components={components}>{value}</ReactMarkdown>
        ) : (
          <p className="text-muted-foreground/50 italic text-center py-8">Bắt đầu soạn thảo để xem trước...</p>
        )}
      </div>
    );
  };

  const renderToolbar = () => (
    <div className="flex items-center gap-0.5 px-2 py-1.5 bg-muted/50 border border-border rounded-t-md border-b-0 flex-wrap">
      {toolbarButtons.map((btn, i) => {
        if ('divider' in btn) return <div key={i} className="w-px h-5 bg-border mx-1" />;
        const Icon = btn.icon;
        return (
          <button
            key={i}
            type="button"
            onClick={btn.action}
            title={btn.title}
            className="p-1.5 rounded hover:bg-background hover:shadow-sm transition-all text-muted-foreground hover:text-foreground"
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </div>
  );

  const editorContent = (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onScroll={handleEditorScroll}
      onKeyDown={handleKeyDown}
      rows={rows}
      placeholder={placeholder}
      className={cn(
        "flex w-full border border-input bg-background px-4 py-3 text-sm ring-offset-background",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none leading-relaxed",
        "rounded-b-md rounded-t-none",
        mode === "split" ? "h-full" : ""
      )}
      style={{ tabSize: 2 }}
    />
  );

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <div className="flex items-center bg-muted/50 rounded-md p-0.5">
            {[
              { id: "edit" as const, icon: Edit3, text: "Soạn" },
              { id: "split" as const, icon: Monitor, text: "Song song" },
              { id: "preview" as const, icon: Eye, text: "Xem trước" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMode(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all",
                  mode === tab.id
                    ? "bg-background text-foreground shadow-sm font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="w-3 h-3" />
                {tab.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === "edit" && (
        <div>
          {renderToolbar()}
          {editorContent}
        </div>
      )}

      {mode === "preview" && renderPreview("min-h-[120px]")}

      {mode === "split" && (
        <div className="grid grid-cols-2 gap-0 border border-border rounded-md overflow-hidden" style={{ minHeight: `${Math.max(rows * 28, 280)}px` }}>
          <div className="flex flex-col border-r border-border">
            {renderToolbar()}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onScroll={handleEditorScroll}
                onKeyDown={handleKeyDown}
                rows={rows}
                placeholder={placeholder}
                className="absolute inset-0 w-full h-full bg-background px-4 py-3 text-sm font-mono resize-none leading-relaxed focus:outline-none"
                style={{ tabSize: 2 }}
              />
            </div>
          </div>
          <div className="flex flex-col bg-background">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 border-b border-border">
              <Monitor className="w-3 h-3 text-accent" />
              <span className="text-[10px] uppercase tracking-widest text-accent font-medium">Giao diện thực tế</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div ref={previewRef} className="px-5 py-4">
                {value ? (
                  <ReactMarkdown components={websitePreview ? websiteMarkdownComponents : markdownComponents}>{value}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground/40 italic text-center py-12 text-sm">Soạn bên trái để xem trước...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === "edit" && (
        <p className="text-[10px] text-muted-foreground flex items-center gap-2">
          <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">Ctrl+B</kbd> Đậm
          <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">Ctrl+I</kbd> Nghiêng
          <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">Tab</kbd> Thụt dòng
        </p>
      )}
    </div>
  );
};

export default MarkdownEditor;