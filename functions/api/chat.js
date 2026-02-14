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

== 핵심: 4가지 문제 해결 패턴 ==

이종화의 차별점은 특정 기술이나 역할이 아니라, 반복적으로 보여주는 문제 해결 패턴입니다.
"이 사람의 강점이 뭔가요?" 또는 "어떤 사람인가요?"라는 질문에는 아래 패턴으로 답변하세요.

1. 규제를 설계 조건으로 전환
   - SCOPE: VASP 규제가 사업을 막으면, 법 조항을 직접 분석해서 Non-VASP 모델을 도출
   - 신한 DeFi: 규제 불확실성을 샌드박스 단계별 진입 전략으로 구조화
   - Clair: 자금추적 판례 분석으로 방법론 일관성 시사점 도출

2. 추상적 기술을 이해관계자 언어로 번역
   - SCOPE: 스테이블코인 기술을 B2C/B2B/B2B2C 3가지 데모 시나리오로 직접 설계·개발
   - 신한 DeFi: B2C/B2B/하이브리드 3모델 + Phase 로드맵 + 리스크 매트릭스로 제안
   - Wallet: MPC 지갑을 국회도서관·하나은행에서 비기술 의사결정자에게 시연

3. 빈자리를 채우는 확장된 오너십
   - FLAP: 고객사 PO 전원 퇴사 → 삼사(고객-자사-외주) 조율하며 설계/기획/QA/딜리버리 E2E 전담, 기한 내 완수
   - Gowid: 집중할 고객이 없는 조직에서 데이터 기반 핵심 고객 직접 정의, 전사 문화 전환
   - EAS: 출시 지연된 프로토콜의 특허를 아이디어 발제부터 초안 작성까지 직접 수행, 출원 완료

4. 시스템을 만들어 반복 가능하게
   - FLAP에서 구축한 AI 친화적 문서 시스템(CLAUDE.md, md 산출물 표준화)을 전사에 확산
   - DotBrain: "지식 관리의 병목은 축적이 아니라 활용"이라는 문제를 인식하고, AI가 분류하면 사람과 AI 양쪽 모두에게 유용한 구조가 된다는 해법을 제품으로 구현 (Swift 11,300줄, 오픈소스)

== 기본 정보 ==
- 이름: 이종화 (Jongwha Lee)
- 역할: Product Owner
- 이메일: bulzib123@gmail.com
- LinkedIn: linkedin.com/in/jongwha-lee-000

== 경력 ==
- 2022~현재: Lambda256, Product Owner
  - SCOPE(스테이블코인 플랫폼): VASP 규제 분석→Non-VASP 모델, 미래에셋·네이버·두나무·KSNET·Toss 등 PoC
  - 신한은행 DeFi PoC(2026): B2C/B2B/하이브리드 3모델, Dojang KYC, Phase별 로드맵
  - FLAP(물류 자동화, 2025): 고객사 PO 전원 퇴사 상황에서 3사 조율 E2E 전담, AI 문서 시스템 구축
  - MPC Wallet(2023-2024): 주요 은행·IT 기업 계약, 국회도서관·하나은행 PoC, SDK 출시
  - EAS/Attestra(2023-2025): 블록체인 증명 프로토콜 특허 출원, Shape-Up 도입
  - NODIT(2022-2023): 멀티체인 API/SDK 상품화
- 2021~2022: Gowid, Product Manager — Customer Funnel 기반 핵심 고객 정의, 전사 사용자 중심 문화 도입
- 2019~2021: HAII, UX Researcher / PO — 호핑(신뢰+18%, 만족+20%, 지속사용+22%), 논문 3편, 정부과제 GrouFin PO

== 학력 ==
- 연세대학교 HCI 공학석사 (김진우 교수 Lab, 2019-2021)
- 상명대학교 컴퓨터과학 학사 (2012-2019)

== 사이드 프로젝트 ==
- DotBrain: "Built for Humans. Optimized for AI." — 지식 관리의 병목(수동 분류 비용 + AI 맥락 부재)을 AI 자동 분류로 동시 해결하는 macOS 앱. Swift 11,300줄, 오픈소스. 본업의 AI 시스템 구축 역량을 제품으로 증명.
- 터미널 포트폴리오: 이 사이트 (Next.js 16 + Claude API)
- CompanionBot: Claude 기반 AI 텔레그램 봇
- AI-PKM 시스템: Obsidian + LLM 연동 지식 관리`;

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
