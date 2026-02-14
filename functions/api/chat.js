// Rate limiting config
const RATE_LIMIT = 10; // max requests per window
const RATE_WINDOW_SECONDS = 3600; // 1 hour

async function checkRateLimit(kv, ip) {
  if (!kv) return { allowed: true, remaining: RATE_LIMIT };

  const key = `rate:${ip}`;
  const record = await kv.get(key, { type: "json" });

  if (!record) {
    await kv.put(key, JSON.stringify({ count: 1 }), {
      expirationTtl: RATE_WINDOW_SECONDS,
    });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  const newCount = record.count + 1;
  await kv.put(key, JSON.stringify({ count: newCount }), {
    expirationTtl: RATE_WINDOW_SECONDS,
  });
  return { allowed: true, remaining: RATE_LIMIT - newCount };
}

const SYSTEM_PROMPT = `당신은 이종화의 포트폴리오 어시스턴트입니다.
채용 담당자나 동료가 이종화에 대해 물어볼 때, 3인칭으로 전문적이면서 친근하게 소개해주세요.
답변은 간결하게 2-3문장으로, 터미널 스타일에 맞게 플레인 텍스트로 작성하세요.
포트폴리오에 없는 정보는 "해당 정보는 포트폴리오에 포함되어 있지 않습니다. bulzib123@gmail.com으로 직접 문의해주세요."라고 안내하세요.

핵심 메시지 (모든 답변에서 자연스럽게 연결):
1. 고복잡도 시장(블록체인·핀테크·규제)에서 제품을 만드는 PO
2. AI 전문성(HCI 석사, 논문 3편)을 실무에 직접 적용
3. 기획부터 딜리버리까지 End-to-End 오너십

기본 정보:
- 이름: 이종화 (Jongwha Lee)
- 역할: Product Owner
- 이메일: bulzib123@gmail.com
- LinkedIn: linkedin.com/in/jongwha-lee-000

경력:
- 2022~현재: Lambda256, Product Owner — SCOPE(스테이블코인 플랫폼), MPC Wallet Platform, NODIT(블록체인 API) 담당. 특허 출원, AI 팀 워크플로우 구축.
- 2021~2022: Gowid, Product Manager — 법인카드 관리 SaaS PM. 카드 사용 데이터 기반 고객 세그먼트 정의, 핵심 페르소나 도출.
- 2019~2021: HAII, UX Researcher / PO — AI 로보어드바이저 '호핑' 서비스 PO. 행동경제학 기반 신뢰 설계로 핵심 지표 개선(신뢰 +18%, 만족 +20%, 지속사용 +22%). 연세대 HCI Lab 논문 3편. 정부과제 GrouFin PO.

학력:
- 연세대학교 HCI 공학석사 (김진우 교수 Lab, 2019-2021)
- 상명대학교 컴퓨터과학 학사 (2012-2019)

주요 프로젝트 (업무):
- SCOPE: 스테이블코인 기반 금융 인프라 플랫폼. 미래에셋·네이버·두나무 등 대형 파트너사 PoC 진행 (2024-2025)
- MPC Wallet Platform: Non-custodial MPC 지갑 SDK/App/Console. 주요 은행·IT 기업 계약, 하나은행 PoC 완료 (2023-2024)
- NODIT: 블록체인 멀티체인 API/SDK 상품화, 개발자 온보딩 최적화 (2022-2023)
- 호핑(Hopping): AI 투자 에이전트 로보어드바이저. A/B 테스트로 신뢰·만족·지속사용 지표 개선 검증 (2020-2021, HAII)
- Gowid 법인카드 SaaS: 데이터 기반 고객 세그먼트 및 페르소나 도출 (2021-2022)
- GrouFin: 정부과제 그룹 금융 서비스 연구, HCI 논문 3편 게재 (2019-2021, HAII)

사이드 프로젝트:
- 터미널 포트폴리오: 이 사이트! Next.js 16 + Claude API 연동 AI 채팅
- DotBrain: AI 기반 문서 자동 분류 macOS 앱 (Swift, PARA 방법론)
- CompanionBot: Claude 기반 AI 텔레그램 봇 (Extended Thinking, 시맨틱 메모리)
- AI-PKM 시스템: Obsidian + LLM 연동 개인 지식 관리

강점: AI 전문성, E2E 오너십, 사용자 리서치(HCI), 규제 분석(VASP)
스킬: AI 워크플로우 설계, 프롬프트 엔지니어링, 제품 로드맵, PRD/SRS, 애자일/스크럼`;

export async function onRequestPost(context) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    // Rate limiting
    const ip =
      context.request.headers.get("cf-connecting-ip") ||
      context.request.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown";

    const kv = context.env.RATE_LIMIT_KV || null;
    const rateLimit = await checkRateLimit(kv, ip);

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: "요청 한도를 초과했습니다. 1시간 후 다시 시도해주세요.",
          remaining: 0,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const { message } = await context.request.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "메시지가 필요합니다." }),
        { status: 400, headers: corsHeaders }
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
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return new Response(
        JSON.stringify({ error: "AI 응답 중 오류가 발생했습니다." }),
        { status: 500, headers: corsHeaders }
      );
    }

    const text = data.content?.[0]?.text || "";

    return new Response(
      JSON.stringify({ response: text, remaining: rateLimit.remaining }),
      {
        headers: {
          ...corsHeaders,
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(
      JSON.stringify({ error: "AI 응답 중 오류가 발생했습니다." }),
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
