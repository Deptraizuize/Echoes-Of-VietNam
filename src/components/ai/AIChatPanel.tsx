import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Scroll } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/history-chat`;

interface AIChatPanelProps {
  onClose: () => void;
  milestoneId?: string;
  milestoneTitle?: string;
}

const QUICK_ACTIONS = [
  { label: "🏛️ Di tích", prompt: "Hãy cho tôi biết về các di tích lịch sử liên quan đến cột mốc này, bao gồm vị trí và ý nghĩa." },
  { label: "👤 Nhân vật", prompt: "Hãy kể chi tiết về các nhân vật lịch sử quan trọng trong sự kiện này." },
  { label: "📚 Tài liệu", prompt: "Gợi ý cho tôi các nguồn tài liệu, bài viết chính thống để tìm hiểu thêm về sự kiện lịch sử này." },
  { label: "📍 Địa điểm", prompt: "Mô tả các địa điểm quan trọng liên quan đến sự kiện này và vị trí của chúng trên bản đồ Việt Nam." },
];

const AIChatPanel = ({ onClose, milestoneId, milestoneTitle }: AIChatPanelProps) => {
  const greeting = milestoneTitle
    ? `Xin chào! 👋 Mình là trợ lý AI chuyên sâu về **${milestoneTitle}**. Bạn có thể hỏi về diễn biến, nhân vật, di tích hoặc tra cứu thêm tài liệu liên quan!`
    : "Xin chào! 👋 Mình là trợ lý AI Lịch sử Việt Nam. Bạn muốn tìm hiểu về giai đoạn hay sự kiện nào?";

  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: greeting },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (overrideText?: string) => {
    const text = (overrideText || input).trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    if (!overrideText) setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...messages.filter((_, i) => i !== 0), userMsg];

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages,
          milestoneId,
          milestoneTitle,
        }),
      });

      if (!resp.ok || !resp.body) {
        const errData = resp.status === 429 || resp.status === 402 ? await resp.json() : null;
        toast({ title: "Lỗi", description: errData?.error || "Không thể kết nối AI", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > 1) {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch { /* partial json */ }
        }
      }
    } catch {
      toast({ title: "Lỗi kết nối", description: "Không thể kết nối tới AI", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 z-50 sm:w-[400px] h-[75vh] sm:h-[560px] max-h-[620px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header - Vietnamese themed */}
      <div className="relative px-4 py-3 border-b border-accent/20 bg-foreground text-primary-foreground">
        <div className="absolute inset-0 opacity-[0.04] heritage-pattern" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Scroll className="w-4 h-4 text-accent" />
            </div>
            <div>
              <span className="font-semibold text-sm text-primary-foreground block leading-tight">Trợ lý Lịch sử</span>
              <span className="text-[10px] text-accent font-medium">✦ Người Yêu Sử</span>
            </div>
          </div>
          <button onClick={onClose} className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {milestoneTitle && (
          <div className="relative mt-2 px-2.5 py-1.5 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-[10px] text-accent truncate">📜 {milestoneTitle}</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Scroll className="w-3.5 h-3.5 text-accent" />
              </div>
            )}
            <div className={`max-w-[82%] rounded-xl px-3 py-2 text-sm ${
              msg.role === "user"
                ? "bg-accent text-accent-foreground rounded-br-sm"
                : "bg-muted text-foreground rounded-bl-sm"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-1.5 [&_p]:leading-relaxed [&_h2]:text-sm [&_h2]:font-bold [&_h2]:mb-1 [&_h2]:mt-2 [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:mb-1 [&_h3]:mt-1.5 [&_ul]:mb-1.5 [&_ul]:pl-4 [&_ol]:mb-1.5 [&_ol]:pl-4 [&_li]:mb-0.5 [&_li]:text-sm [&_blockquote]:border-accent [&_blockquote]:bg-accent/5 [&_blockquote]:py-1 [&_blockquote]:px-3 [&_blockquote]:rounded-r-lg [&_blockquote]:text-xs [&_blockquote]:italic [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_strong]:text-foreground [&_code]:text-xs [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-3.5 h-3.5 text-accent-foreground" />
              </div>
            )}
          </div>
        ))}

        {/* Quick actions after greeting */}
        {messages.length === 1 && milestoneTitle && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {QUICK_ACTIONS.map((action, i) => (
              <button
                key={i}
                onClick={() => send(action.prompt)}
                disabled={isLoading}
                className="text-xs bg-accent/5 hover:bg-accent/15 border border-accent/20 text-foreground rounded-lg px-2.5 py-1.5 transition-colors hover:border-accent/40"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <Scroll className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="bg-muted rounded-xl px-3 py-2.5 rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-3 py-2.5 flex gap-2 bg-card">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Hỏi về lịch sử Việt Nam..."
          className="flex-1 bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground outline-none rounded-lg px-3 py-2 border border-border focus:border-accent/40 transition-colors"
          disabled={isLoading}
        />
        <Button size="icon" onClick={() => send()} disabled={isLoading || !input.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90 h-9 w-9 rounded-lg">
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
};

export default AIChatPanel;
