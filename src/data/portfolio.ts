export const portfolio = {
  // 메트릭 (상단 바)
  metrics: {
    projects: 10,
    exp: "6yr",
  },

  // 기본 정보
  profile: {
    name: "이종화",
    nameEn: "Jongwha Lee",
    role: "Product Owner",
    email: "bulzib123@gmail.com",
    linkedin: "linkedin.com/in/jongwha-lee-000",
    phone: "010.8531.3992",
  },

  // HOME 섹션
  home: {
    tagline: "where ideas become products.",
    asciiArt: `
██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗ ██████╗
██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║██╔═══██╗
██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║     ██║██║   ██║
██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║     ██║██║   ██║
██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝
╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝
`,
    intro: [
      "안녕하세요.",
      "고복잡도 시장의 어려운 문제에서 기회를 발견하고,",
      "제품으로 풀어내는 Product Owner 이종화입니다.",
      "",
      "기술과 규제가 얽힌 도메인에서",
      "사용자 관점의 해결책을 만들어갑니다.",
    ],
    highlights: [
      {
        title: "스테이블코인 플랫폼 PO",
        desc: "규제·금융·블록체인이 맞물린 고복잡도 시장에서 제품 전략 및 로드맵 수립. 고객사 대상 기술 검토·제안으로 규제 리스크를 선제적으로 관리하고 사업 기회 연결",
      },
      {
        title: "AI 전문성",
        desc: "HCI 석사, AI 논문 3편(서비스 설계·신뢰 회복·AI포트폴리오). 조직 AI 워크플로우 설계→적용→배포 경험, 개인 AI-PKM 운영 체계화",
      },
      {
        title: "End-to-End 오너십",
        desc: "아이디어는 빠르게 데모로 직접 구현해 필드 검증까지. 출시 지연 과제는 특허 작성 리드하여 특허 출원 및 내부 지식/자산화",
      },
    ],
  },

  // ABOUT 섹션
  about: {
    asciiArt: `
 █████╗ ██████╗  ██████╗ ██╗   ██╗████████╗
██╔══██╗██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝
███████║██████╔╝██║   ██║██║   ██║   ██║
██╔══██║██╔══██╗██║   ██║██║   ██║   ██║
██║  ██║██████╔╝╚██████╔╝╚██████╔╝   ██║
╚═╝  ╚═╝╚═════╝  ╚═════╝  ╚═════╝    ╚═╝
`,
    whoAmI: {
      title: "WHY I DO THIS",
      content: [
        "복잡한 문제일수록 풀었을 때 가치가 크다고 믿습니다.",
        "규제와 기술이 맞물린 블록체인·핀테크에서 일하는 이유도 같습니다.",
        "",
        "사용자가 겪는 진짜 문제를 찾고,",
        "엔지니어·디자이너·법무와 함께 해결책을 만들어갑니다.",
      ],
    },
    coreValues: {
      title: "CORE VALUES",
      content: [
        "● 문제 발굴 — 겉으로 드러난 요구사항이 아닌, 진짜 문제를 찾습니다",
        "● 사용자 중심 — 사용자의 입장에서 제품의 문제를 풀어냅니다",
        "● 빠른 검증 — 아이디어를 데모로 직접 구현해 필드에서 검증합니다",
      ],
    },
    strengths: {
      title: "HOW I WORK",
      items: [
        {
          name: "리서치 방법론",
          description: "연세대 HCI Lab (김진우 교수) — IDI, FGI, A/B 테스트, 정성+정량 혼합 설계",
        },
        {
          name: "AI 실무 적용",
          description: "논문 연구(3편)에서 팀 워크플로우 설계까지. Claude/Cursor 기반 생산성 시스템 직접 구축·배포",
        },
        {
          name: "이해관계자 조율",
          description: "엔지니어·디자인·법무·경영진 사이에서 기술 검토와 규제 리스크를 동시에 조율하여 의사결정 리드",
        },
        {
          name: "규제 기반 제품 설계",
          description: "VASP 규제 분석 → Non-VASP 모델 도출, 규제 리스크를 제품 전략으로 전환",
        },
      ],
    },
    background: {
      title: "BACKGROUND",
      education: [
        { period: "2019 - 2021", school: "연세대학교", major: "HCI 공학석사" },
        { period: "2012 - 2019", school: "상명대학교", major: "컴퓨터과학 학사" },
      ],
      career: [
        { period: "2022 - Present", company: "Lambda256", role: "Product Owner" },
        { period: "2021 - 2022", company: "Gowid", role: "Product Manager" },
        { period: "2019 - 2021", company: "HAII", role: "UX Researcher / PO" },
      ],
    },
  },

  // WORK 섹션
  work: {
    asciiArt: `
██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗
██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝
██║ █╗ ██║██║   ██║██████╔╝█████╔╝
██║███╗██║██║   ██║██╔══██╗██╔═██╗
╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗
 ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
`,
    description: "주요 프로젝트들입니다.",
    projects: [
      {
        slug: "project-scope",
        title: "SCOPE",
        period: "2024 - 2025",
        role: "Product Owner",
        summary: "스테이블코인 기반 금융 인프라 플랫폼",
        description: [
          "● 문제: 스테이블코인 결제/정산의 규제 리스크와 기술 복잡성",
          "● 솔루션: Tokenization~Settlement~Compliance 통합 설계, Non-VASP 모델 도출",
          "● 결과: 미래에셋·네이버·두나무 등 대형 파트너사 PoC 진행",
        ],
        tags: ["Stablecoin", "FinTech", "RegTech", "VASP"],
        link: null,
      },
      {
        slug: "project-wallet",
        title: "MPC Wallet Platform",
        period: "2023 - 2024",
        role: "Product Owner",
        summary: "Non-custodial MPC 지갑 플랫폼 (SDK/App/Console)",
        description: [
          "● 문제: 기업 지갑 통합의 기술 장벽 + 개인키 관리 리스크",
          "● 솔루션: MPC 기반 키 분산으로 보안·복구 동시 해결, 멀티 딜리버리",
          "● 결과: 주요 은행·대형 IT 기업 계약, 국회도서관·하나은행 PoC 완료",
        ],
        tags: ["MPC", "Non-custodial", "SDK", "FinTech"],
        link: null,
      },
      {
        slug: "project-hopping",
        title: "호핑 (Hopping)",
        period: "2020 - 2021",
        role: "UX Researcher / PO",
        summary: "AI 투자 에이전트 기반 로보어드바이저 서비스",
        description: [
          "● 문제: 로보어드바이저 '블랙박스' 불신, 손실 민감성으로 인한 이탈",
          "● 솔루션: 행동경제학 기반 AI 에이전트 피드백 시스템 설계",
          "● 결과: 신뢰 +18%, 만족 +20%, 지속사용의사 +22% (A/B 테스트 검증)",
        ],
        tags: ["AI Agent", "FinTech", "Behavioral Economics", "UX"],
        link: null,
      },
      {
        slug: "project-nodit",
        title: "NODIT",
        period: "2022 - 2023",
        role: "Product Owner",
        summary: "블록체인 멀티체인 API/SDK 상품화 플랫폼",
        description: [
          "● 문제: 블록체인 데이터 접근의 높은 기술 장벽, 개발자별 개별 노드 운영 부담",
          "● 솔루션: 멀티체인 API/SDK 상품화, 개발자 온보딩 최적화 (문서·샌드박스·대시보드)",
          "● 결과: 개발자 DX 중심 설계로 API 채택률 향상, 기술 문서 체계 구축",
        ],
        tags: ["Blockchain", "API", "DevTools", "DX"],
        link: null,
      },
      {
        slug: "project-gowid",
        title: "법인카드 관리 SaaS",
        period: "2021 - 2022",
        role: "Product Manager",
        summary: "법인카드 사용 데이터 기반 비용 관리 SaaS",
        description: [
          "● 문제: 법인카드 비용 관리의 수작업 비효율과 데이터 사일로",
          "● 솔루션: 카드 사용 데이터 분석 기반 고객 세그먼트 정의, 핵심 페르소나 도출",
          "● 결과: 데이터 드리븐 고객 분류 체계 수립, 타겟 마케팅 기반 마련",
        ],
        tags: ["SaaS", "FinTech", "Data", "B2B"],
        link: null,
      },
      {
        slug: "project-groufin",
        title: "GrouFin",
        period: "2019 - 2021",
        role: "UX Researcher",
        summary: "정부과제 기반 그룹 금융 서비스 연구",
        description: [
          "● 문제: 개인 투자의 정보 비대칭과 그룹 기반 금융 서비스 가능성 탐색",
          "● 솔루션: IDI/FGI/A/B 테스트 기반 사용자 니즈 도출, AI 포트폴리오 서비스 설계",
          "● 결과: Human-AI Interaction 논문 3편 게재, 정부과제 목표 달성",
        ],
        tags: ["Research", "HCI", "AI", "Government"],
        link: null,
      },
    ],
  },

  // FUN 섹션
  fun: {
    asciiArt: `
███████╗██╗   ██╗███╗   ██╗
██╔════╝██║   ██║████╗  ██║
█████╗  ██║   ██║██╔██╗ ██║
██╔══╝  ██║   ██║██║╚██╗██║
██║     ╚██████╔╝██║ ╚████║
╚═╝      ╚═════╝ ╚═╝  ╚═══╝
`,
    description: "업무 외 사이드 프로젝트들입니다.",
    projects: [
      {
        slug: "side-terminal-portfolio",
        title: "터미널 포트폴리오",
        summary: "이 사이트! AI와 대화하는 터미널 스타일 포트폴리오",
        description: [
          "● Next.js 16 + React 19 + Tailwind CSS",
          "● Claude API 연동 AI 채팅 기능",
          "● 터미널 인터페이스 UX 구현",
        ],
        link: null,
      },
      {
        slug: "side-dotbrain",
        title: "DotBrain",
        summary: "AI 기반 문서 자동 분류 macOS 앱",
        description: [
          "● 파일을 인박스에 드롭하면 AI가 PARA 방법론으로 자동 분류",
          "● 2단계 AI 분류: Fast(Haiku/Flash) → Precise(Sonnet/Pro)",
          "● PDF, 이미지, 워드, 엑셀, PPT 등 다양한 포맷 지원",
          "● Human-readable + AI-optimized 설계 철학",
        ],
        link: "https://github.com/DinN0000/DotBrain",
      },
      {
        slug: "side-companionbot",
        title: "CompanionBot",
        summary: "Claude 기반 개인 AI 친구 텔레그램 봇",
        description: [
          "● Extended Thinking으로 깊이 있는 대화",
          "● 시맨틱 메모리로 맥락 유지 및 관련 기억 검색",
          "● 20+ 도구 지원 (파일, 웹검색, 일정, 메모리 등)",
          "● npm 패키지로 간편 설치 및 커스터마이징",
        ],
        link: "https://github.com/DinN0000/CompanionBot",
      },
      {
        slug: "side-ai-pkm",
        title: "AI-Powered PKM 시스템",
        summary: "LLM 연동 개인 지식 관리 시스템",
        description: [
          "● Obsidian + LLM 연동으로 메모 자동 태깅, 연관 지식 추천",
          "● 커리어, 프로젝트, 학습 내용 체계적 정리 및 인사이트 추출",
        ],
        link: null,
      },
    ],
  },

  // RESUME 섹션
  resume: {
    asciiArt: `
██████╗ ███████╗███████╗██╗   ██╗███╗   ███╗███████╗
██╔══██╗██╔════╝██╔════╝██║   ██║████╗ ████║██╔════╝
██████╔╝█████╗  ███████╗██║   ██║██╔████╔██║█████╗
██╔══██╗██╔══╝  ╚════██║██║   ██║██║╚██╔╝██║██╔══╝
██║  ██║███████╗███████║╚██████╔╝██║ ╚═╝ ██║███████╗
╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝
`,
    experience: [
      {
        period: "2022 - Present",
        company: "Lambda256",
        role: "Product Owner",
        description: "MPC 지갑 SDK로 주요 은행·IT 기업 계약 체결. 스테이블코인 플랫폼 규제 전략 수립, 특허 출원. AI 기반 팀 생산성 시스템 구축.",
      },
      {
        period: "2021 - 2022",
        company: "Gowid",
        role: "Product Manager",
        description: "법인카드 관리 SaaS PM. 카드 사용 데이터 기반 고객 세그먼트 정의, 핵심 고객 페르소나 도출.",
      },
      {
        period: "2019 - 2021",
        company: "HAII",
        role: "UX Researcher / PO",
        description: "AI 로보어드바이저 '호핑' 서비스 기획 PO. 행동경제학 기반 Human-AI 신뢰 설계로 핵심 지표 개선. 연세대 HCI Lab 논문 3편 발표. 정부과제 AI 프로젝트 PO.",
      },
    ],
    education: [
      {
        period: "2019 - 2021",
        school: "연세대학교",
        major: "HCI 공학석사",
        description: "김진우 교수 HCI Lab. 사용자 리서치, 인터랙션 디자인 연구.",
      },
      {
        period: "2012 - 2019",
        school: "상명대학교",
        major: "컴퓨터과학 학사",
        description: "소프트웨어 개발 기초, 알고리즘, 데이터베이스.",
      },
    ],
    skills: {
      ai: ["AI 워크플로우 설계", "프롬프트 엔지니어링", "Human-AI Interaction"],
      product: ["제품 로드맵", "PRD/SRS 작성", "애자일/스크럼", "사용자 리서치", "A/B 테스트"],
      tools: ["Claude/Cursor", "Figma", "Jira", "Notion", "SQL", "GitHub"],
      domain: ["블록체인", "스테이블코인", "MPC 지갑", "VASP 규제", "핀테크"],
    },
  },
};

export type Portfolio = typeof portfolio;
