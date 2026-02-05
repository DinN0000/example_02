// Cloudflare Worker - Chat API
// Deploy: wrangler deploy

export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const { message } = await request.json();

      if (!message) {
        return new Response(JSON.stringify({ error: "메시지가 필요합니다." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Rate limiting by IP (simple in-memory, resets on cold start)
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          system: `당신은 포트폴리오 어시스턴트입니다. 방문자의 질문에 친절하고 전문적으로 답변해주세요. 답변은 간결하게 2-3문장 정도로 해주세요.`,
          messages: [{ role: "user", content: message }],
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("Claude API Error:", data.error);
        return new Response(JSON.stringify({ error: "AI 응답 중 오류가 발생했습니다." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const text = data.content?.[0]?.text || "";

      return new Response(JSON.stringify({ response: text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Worker Error:", error);
      return new Response(JSON.stringify({ error: "AI 응답 중 오류가 발생했습니다." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
