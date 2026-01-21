export const portfolio = {
  // 메트릭 (상단 바)
  metrics: {
    projects: 4,
    exp: "3yr",
  },

  // 기본 정보
  profile: {
    name: "홍길동",
    nameEn: "Hong Gildong",
    role: "Product Owner",
    email: "hello@example.com",
    github: "github.com/example",
    linkedin: "linkedin.com/in/example",
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
      "사용자 중심의 제품을 만드는 Product Owner입니다.",
      "",
      "데이터 기반 의사결정과 애자일 방법론을 통해",
      "비즈니스 가치를 창출하는 제품을 성장시킵니다.",
    ],
    highlights: [
      "● 3년간 B2B SaaS, 커머스, 플랫폼 제품 기획 경험",
      "● 4개의 제품 출시 및 운영 경험",
      "● 사용자 리서치부터 출시까지 End-to-End 제품 개발 리드",
    ],
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
        slug: "project-alpha",
        title: "Project Alpha",
        period: "2024.01 - 2024.06",
        role: "Product Owner",
        summary: "AI 기반 고객 서비스 자동화 플랫폼",
        description: [
          "● 문제: 고객 문의 응대에 평균 4시간 소요, CS 인력 부족",
          "● 솔루션: AI 챗봇 + 자동 분류 시스템 구축",
          "● 결과: 응답 시간 80% 단축, 고객 만족도 35% 향상",
        ],
        tags: ["B2B", "AI/ML", "SaaS"],
        link: "https://example.com/alpha",
      },
      {
        slug: "project-beta",
        title: "Project Beta",
        period: "2023.06 - 2023.12",
        role: "Product Manager",
        summary: "모바일 커머스 리디자인 프로젝트",
        description: [
          "● 문제: 모바일 전환율 2.1%로 업계 평균 대비 낮음",
          "● 솔루션: 사용자 여정 분석 기반 UX 전면 개편",
          "● 결과: 전환율 3.8%로 향상, MAU 50% 증가",
        ],
        tags: ["E-commerce", "Mobile", "UX"],
        link: "https://example.com/beta",
      },
      {
        slug: "project-gamma",
        title: "Project Gamma",
        period: "2023.01 - 2023.05",
        role: "Product Manager",
        summary: "데이터 대시보드 MVP 개발",
        description: [
          "● 문제: 비즈니스 인사이트 도출에 수일 소요",
          "● 솔루션: 실시간 데이터 시각화 대시보드 구축",
          "● 결과: 의사결정 속도 60% 향상, 전사 도입",
        ],
        tags: ["Data", "Dashboard", "B2B"],
        link: null,
      },
      {
        slug: "project-delta",
        title: "Project Delta",
        period: "2022.06 - 2022.12",
        role: "Associate PM",
        summary: "사내 협업 도구 개선 프로젝트",
        description: [
          "● 문제: 부서간 협업 시 정보 단절 및 중복 작업 발생",
          "● 솔루션: 통합 워크스페이스 및 알림 시스템 구축",
          "● 결과: 협업 효율성 40% 향상, 회의 시간 30% 단축",
        ],
        tags: ["Internal Tool", "Productivity"],
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
        slug: "side-project-1",
        title: "개인 블로그",
        summary: "기술 및 제품 관련 인사이트 공유",
        description: [
          "● Next.js + MDX 기반 정적 블로그",
          "● 월 평균 5,000 방문자",
          "● 제품 기획, 애자일, 사용자 리서치 주제",
        ],
        link: "https://blog.example.com",
      },
      {
        slug: "side-project-2",
        title: "오픈소스 기여",
        summary: "디자인 시스템 라이브러리 기여",
        description: [
          "● Radix UI 한국어 문서화 기여",
          "● 접근성 관련 이슈 리포트 및 수정",
        ],
        link: "https://github.com/example",
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
        period: "2024.01 - Present",
        company: "Company A",
        role: "Product Owner",
        description: "핵심 제품 로드맵 수립 및 실행, 크로스펑셔널 팀 리드",
      },
      {
        period: "2023.01 - 2023.12",
        company: "Company B",
        role: "Product Manager",
        description: "B2B SaaS 제품 기획 및 출시, 고객 인터뷰 및 요구사항 분석",
      },
      {
        period: "2022.01 - 2022.12",
        company: "Company C",
        role: "Associate PM",
        description: "사용자 리서치 및 기능 정의, PRD 작성 및 스펙 관리",
      },
    ],
    education: [
      {
        period: "2018 - 2022",
        school: "OO대학교",
        major: "경영학과",
        description: "서비스 기획 동아리 활동, 스타트업 인턴십",
      },
    ],
    skills: {
      product: ["제품 로드맵", "PRD 작성", "애자일/스크럼", "A/B 테스트"],
      tools: ["Figma", "Jira", "Notion", "SQL", "GA4", "Amplitude"],
      soft: ["크로스펑셔널 협업", "이해관계자 커뮤니케이션", "데이터 기반 의사결정"],
    },
  },
};

export type Portfolio = typeof portfolio;
