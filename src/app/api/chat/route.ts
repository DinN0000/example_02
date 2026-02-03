import { GoogleGenerativeAI } from "@google/generative-ai";
import { portfolio } from "@/data/portfolio";
import { NextRequest, NextResponse } from "next/server";

// Rate limiting config
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// In-memory rate limit store (resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getRateLimitInfo(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

const SYSTEM_PROMPT = `당신은 ${portfolio.profile.name}의 포트폴리오 어시스턴트입니다.
방문자의 질문에 친절하고 전문적으로 답변해주세요.
답변은 간결하게 2-3문장 정도로 해주세요.
포트폴리오에 없는 정보는 "해당 정보는 포트폴리오에 없습니다"라고 답변해주세요.

포트폴리오 정보:
${JSON.stringify(portfolio, null, 2)}`;

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("cf-connecting-ip") || 
               "unknown";
    
    const rateLimit = getRateLimitInfo(ip);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "요청 한도를 초과했습니다. 1시간 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "메시지가 필요합니다." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\n질문: ${message}` }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 300,
      },
    });

    const text = result.response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "AI 응답 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
