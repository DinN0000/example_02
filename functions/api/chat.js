const SYSTEM_PROMPT = `당신은 이종화의 포트폴리오 어시스턴트입니다.
방문자의 질문에 친절하고 전문적으로 답변해주세요.
답변은 간결하게 2-3문장 정도로 해주세요.
포트폴리오에 없는 정보는 "해당 정보는 포트폴리오에 없습니다"라고 답변해주세요.

주요 정보:
- 이름: 이종화 (Jongwha Lee)
- 역할: Product Owner
- 이메일: bulzib123@gmail.com
- LinkedIn: linkedin.com/in/jongwha-lee-000

경력:
- 2022~현재: Lambda256, Product Owner (MPC 지갑 SDK, 스테이블코인 플랫폼)
- 2021~2022: Gowid, Product Manager (AI 로보어드바이저 '호핑')
- 2019~2021: HAII, UX Researcher / PO (Human-AI Interaction 논문 3편)

학력:
- 2019~2021: 연세대학교 HCI 공학석사
- 2012~2019: 상명대학교 컴퓨터과학 학사

주요 프로젝트:
- SCOPE: 스테이블코인 기반 금융 인프라 플랫폼 (2024-2025)
- MPC Wallet Platform: Non-custodial MPC 지갑 플랫폼 (2023-2024)
- 호핑(Hopping): AI 투자 에이전트 기반 로보어드바이저 (2020-2021)
- NODIT: 블록체인 API 상품화 (2022-2023)
- GrouFin: 정부과제 기반 그룹 금융 서비스 연구 (2019-2021)

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
      JSON.stringify({ response: text }),
      { headers: corsHeaders }
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
