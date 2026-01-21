import Anthropic from "@anthropic-ai/sdk";
import { portfolio } from "@/data/portfolio";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `당신은 ${portfolio.profile.name}의 포트폴리오 어시스턴트입니다.
방문자의 질문에 친절하고 전문적으로 답변해주세요.
답변은 간결하게 2-3문장 정도로 해주세요.
포트폴리오에 없는 정보는 "해당 정보는 포트폴리오에 없습니다"라고 답변해주세요.

포트폴리오 정보:
${JSON.stringify(portfolio, null, 2)}`;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "메시지가 필요합니다." },
        { status: 400 }
      );
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === "text");
    const text = textContent?.type === "text" ? textContent.text : "";

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Claude API Error:", error);
    return NextResponse.json(
      { error: "AI 응답 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
