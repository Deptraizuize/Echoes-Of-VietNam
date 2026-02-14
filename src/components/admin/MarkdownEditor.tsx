import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  label?: string;
}

const MarkdownEditor = ({ value, onChange, rows = 4, placeholder, label }: Props) => {
  const [preview, setPreview] = useState(false);

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setPreview(!preview)}
            className="h-7 text-xs gap-1"
          >
            {preview ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {preview ? "Soạn" : "Xem trước"}
          </Button>
        </div>
      )}

      {preview ? (
        <div className="min-h-[100px] rounded-md border border-input bg-background px-4 py-3 text-sm prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground">
          {value ? (
            <ReactMarkdown>{value}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic">Chưa có nội dung</p>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            className={cn(
              "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50 font-mono"
            )}
          />
          <p className="text-[11px] text-muted-foreground">
            Hỗ trợ Markdown: **in đậm**, *in nghiêng*, # Tiêu đề, - Danh sách, [link](url)
          </p>
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;
