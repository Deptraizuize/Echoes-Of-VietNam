import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, milestoneId, milestoneTitle } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const milestoneContext = milestoneTitle
      ? `\n\nNgười dùng đang xem cột mốc lịch sử: "${milestoneTitle}" (ID: ${milestoneId || "unknown"}).
Hãy ưu tiên trả lời xoay quanh cột mốc này. Khi được hỏi về:
- Di tích: Mô tả vị trí địa lý cụ thể, tọa độ gần đúng, ý nghĩa lịch sử, tình trạng hiện tại
- Nhân vật: Tiểu sử, vai trò trong sự kiện, đóng góp cụ thể
- Bản đồ/địa điểm: Mô tả vị trí trên bản đồ Việt Nam, các tỉnh thành liên quan
- Tài liệu tham khảo: Gợi ý các nguồn chính thống (sách giáo khoa, Wikipedia tiếng Việt, báo chính thống)
- Câu hỏi quiz: Giải thích lý do đáp án đúng/sai, cung cấp thông tin bổ sung`
      : "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Bạn là một trợ lý AI chuyên gia về Lịch sử Việt Nam, từ thời tiền sử đến hiện đại. Bạn giúp học sinh và người yêu sử hiểu sâu hơn về lịch sử dân tộc.

Nguyên tắc trả lời:
- Trả lời bằng tiếng Việt, chính xác, dễ hiểu
- Dẫn chứng sự kiện, nhân vật, năm tháng cụ thể
- Nếu không chắc chắn, nói rõ và gợi ý nguồn tham khảo
- Khuyến khích tư duy phản biện về lịch sử
- Khi nói về di tích hoặc địa điểm, cung cấp thông tin vị trí cụ thể
- Khi gợi ý tài liệu, ưu tiên nguồn chính thống: SGK Lịch sử, Viện Hàn lâm KHXH, Wikipedia tiếng Việt

QUY TẮC FORMAT BẮT BUỘC - Luôn sử dụng Markdown:
- Dùng **in đậm** cho tên nhân vật, sự kiện, địa danh quan trọng
- Dùng ## cho tiêu đề phần, ### cho tiêu đề phụ
- Dùng danh sách - hoặc 1. 2. 3. để liệt kê
- Dùng > blockquote cho trích dẫn hoặc nhận định quan trọng
- Dùng emoji phù hợp: 📍 (địa điểm), 👤 (nhân vật), 📜 (sự kiện), ⚔️ (chiến tranh), 🏛️ (di tích), 📚 (tài liệu), 🗓️ (thời gian)
- Khi đề cập nhân vật/di tích nổi tiếng, gắn link Wikipedia tiếng Việt: [Tên](https://vi.wikipedia.org/wiki/Tên_nhân_vật)
- Giữ câu trả lời 2-5 đoạn, có cấu trúc rõ ràng
- Kết thúc bằng phần "📚 **Tham khảo thêm**" nếu phù hợp${milestoneContext}`
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Quá nhiều yêu cầu, vui lòng thử lại sau." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Hết quota AI, vui lòng liên hệ admin." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Lỗi AI gateway" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
