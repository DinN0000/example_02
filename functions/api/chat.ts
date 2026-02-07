import { portfolio } from "../../src/data/portfolio";

interface Env {
  ANTHROPIC_API_KEY: string;
}

const SYSTEM_PROMPT = `당신은 ${portfolio.profile.name}의 포트폴리오 어시스턴트입니다.
방문자의 질문에 친절하고 전문적으로 답변해주세요.
답변은 간결하게 2-3문장 정도로 해주세요.
포트폴리오에 없는 정보는 "해당 정보는 포트폴리오에 없습니다"라고 답변해주세요.

포트폴리오 정보:
${JSON.stringify(portfolio, null, 2)}`;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { message } = (await context.request.json()) as { message: string };

    if (!message) {
      return new Response(
        JSON.stringify({ error: "메시지가 필요합니다." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": context.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = (await response.json()) as {
      content: { type: string; text: string }[];
      error?: { message: string };
    };

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return new Response(
        JSON.stringify({ error: "AI 응답 중 오류가 발생했습니다." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const text =
      data.content[0]?.type === "text" ? data.content[0].text : "";

    return new Response(JSON.stringify({ response: text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(
      JSON.stringify({ error: "AI 응답 중 오류가 발생했습니다." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
