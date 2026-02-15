# Terminal Portfolio Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 터미널 포트폴리오의 간격, 팔레트 발견성, 모바일 UX, CRT 효과, AI 채팅 가이드를 개선한다.

**Architecture:** CSS 변수/클래스 수정(globals.css) + React 컴포넌트 조정(Terminal.tsx) + 레이아웃 메타 수정(layout.tsx). 새 파일 생성 없이 기존 3개 파일만 수정.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, TypeScript

---

## Task 1: 숨 쉴 공간 — 간격과 행간 개선

콘텐츠 줄 간격이 2px로 답답하고, 섹션 타이틀과 divider 주변 여백이 부족하다. 읽기 편한 터미널 느낌으로 개선.

**Files:**
- Modify: `src/app/globals.css:38` (line-height)
- Modify: `src/components/Terminal.tsx:706` (section-title spacing)
- Modify: `src/components/Terminal.tsx:693` (divider spacing)
- Modify: `src/components/Terminal.tsx:798` (content container spacing)

**Step 1: line-height 조정**

`src/app/globals.css` 38행:

```css
/* Before */
line-height: 1.7;

/* After */
line-height: 1.85;
```

**Step 2: 콘텐츠 컨테이너 줄 간격 조정**

`src/components/Terminal.tsx` 798행:

```tsx
/* Before */
<div className="w-full max-w-3xl px-6 py-6 space-y-0.5">

/* After */
<div className="w-full max-w-3xl px-6 py-6 space-y-1.5">
```

**Step 3: 섹션 타이틀 여백 증가**

`src/components/Terminal.tsx` 706행:

```tsx
/* Before */
<div key={index} className={`text-section-title font-semibold text-base mt-3 mb-1 ${baseAnimation}`}>

/* After */
<div key={index} className={`text-section-title font-semibold text-base mt-4 mb-2 ${baseAnimation}`}>
```

**Step 4: divider 상하 여백 추가**

`src/components/Terminal.tsx` 694행:

```tsx
/* Before */
<div key={index} className={`text-muted/70 select-none text-sm ${baseAnimation}`}>

/* After */
<div key={index} className={`text-muted/70 select-none text-sm my-2 ${baseAnimation}`}>
```

**Step 5: 로컬 확인**

Run: `cd /tmp/example_02 && npm run dev`

확인 항목:
- Home 섹션에서 하이라이트 항목 간 간격이 자연스러운지
- Work 섹션에서 프로젝트 목록이 답답하지 않은지
- divider(───) 위아래 숨 쉬는 공간이 있는지
- 섹션 타이틀(## HIGHLIGHTS 등)이 본문과 시각적으로 분리되는지

**Step 6: Commit**

```bash
git add src/app/globals.css src/components/Terminal.tsx
git commit -m "improve spacing: line-height, content gap, section titles, dividers"
```

---

## Task 2: 커맨드 팔레트 발견성 개선

현재 인풋 포커스해야만 팔레트가 나타나서 첫 방문자가 존재를 모름. Home 최초 진입 시 자동으로 한 번 표시하고, 하단 힌트를 더 눈에 띄게 한다.

**Files:**
- Modify: `src/components/Terminal.tsx` (state 추가, 팔레트 표시 조건 변경, 힌트 스타일)

**Step 1: 첫 방문 시 팔레트 자동 표시를 위한 state 추가**

`src/components/Terminal.tsx` — state 선언부(~60행 근처)에 추가:

```tsx
const [showPaletteHint, setShowPaletteHint] = useState(false);
```

**Step 2: showHome 콜백에서 팔레트 힌트 트리거**

`src/components/Terminal.tsx` — `showHome` 함수의 `addLines` 콜백 내부(~303행). 최초 1회만 자동 표시:

```tsx
addLines(homeLines, () => {
  setShowMenu(true);
  setPaletteIndex(1);
  // 첫 Home 진입 시 팔레트 힌트 자동 표시 (1회)
  if (!localStorage.getItem('palette_seen')) {
    setShowPaletteHint(true);
    localStorage.setItem('palette_seen', '1');
    setTimeout(() => setShowPaletteHint(false), 4000);
  }
});
```

**Step 3: 팔레트 표시 조건에 showPaletteHint 추가**

`src/components/Terminal.tsx` 827행 — 팔레트 표시 조건:

```tsx
/* Before */
{isFocused && introComplete && !isTyping && !isLoading && !showPressEnter && (

/* After */
{(isFocused || showPaletteHint) && introComplete && !isTyping && !isLoading && !showPressEnter && (
```

**Step 4: 하단 힌트 텍스트 가시성 향상**

`src/components/Terminal.tsx` 868행:

```tsx
/* Before */
<div className="flex items-center justify-between mb-2 text-[10px] text-muted/40">

/* After */
<div className="flex items-center justify-between mb-2 text-[11px] text-muted/60">
```

**Step 5: 로컬 확인**

Run: `cd /tmp/example_02 && npm run dev`

확인 항목:
- 첫 Home 진입 시 팔레트가 자동으로 4초간 표시되는지
- 새로고침 후 두 번째 방문에서는 자동 표시되지 않는지
- 인풋 포커스 시 여전히 팔레트가 정상 작동하는지
- 하단 "Next: [1] /about" 힌트가 이전보다 잘 보이는지

**Step 6: Commit**

```bash
git add src/components/Terminal.tsx
git commit -m "improve command palette discoverability: auto-show on first visit, stronger hints"
```

---

## Task 3: 모바일 터치 타겟 개선

Enter 버튼(28px)이 WCAG 최소 44px에 미달. 팔레트 메뉴 아이템도 모바일에서 탭하기 어려움.

**Files:**
- Modify: `src/components/Terminal.tsx:926` (enter button size)
- Modify: `src/components/Terminal.tsx:847` (menu item padding)
- Modify: `src/components/Terminal.tsx:828` (palette positioning)

**Step 1: Enter 버튼 모바일 크기 증가**

`src/components/Terminal.tsx` 926행:

```tsx
/* Before */
className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center bg-accent/15 text-accent hover:bg-accent/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"

/* After */
className="shrink-0 w-10 h-10 sm:w-7 sm:h-7 rounded-md flex items-center justify-center bg-accent/15 text-accent hover:bg-accent/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
```

**Step 2: 팔레트 메뉴 아이템 터치 영역 증가**

`src/components/Terminal.tsx` 847행:

```tsx
/* Before */
className={`w-full px-3 py-2 rounded-md flex items-center text-left transition-colors duration-100 ${

/* After */
className={`w-full px-3 py-3 sm:py-2 rounded-md flex items-center text-left transition-colors duration-100 ${
```

**Step 3: 팔레트 모바일 전폭 대응**

`src/components/Terminal.tsx` 828행:

```tsx
/* Before */
<div className="fade-in absolute bottom-full right-6 mb-3 w-72 bg-card border border-border rounded-lg overflow-hidden shadow-lg shadow-black/30">

/* After */
<div className="fade-in absolute bottom-full left-4 right-4 sm:left-auto sm:right-6 mb-3 sm:w-72 bg-card border border-border rounded-lg overflow-hidden shadow-lg shadow-black/30">
```

**Step 4: 로컬 확인**

Run: `cd /tmp/example_02 && npm run dev`

브라우저 DevTools에서 모바일 뷰포트(375px)로 확인:
- Enter 버튼이 40px로 편하게 탭 가능한지
- 팔레트가 좌우 여백 남기고 전폭으로 표시되는지
- 팔레트 메뉴 아이템이 탭하기 편한지
- 데스크톱(>640px)에서는 기존과 동일한지

**Step 5: Commit**

```bash
git add src/components/Terminal.tsx
git commit -m "improve mobile touch targets: larger enter button, wider palette, bigger menu items"
```

---

## Task 4: 모바일 패딩 조정

px-6(48px)이 320px 화면에서 과다. 헤더, 콘텐츠, 푸터 모두 모바일에서 px-4로 축소.

**Files:**
- Modify: `src/components/Terminal.tsx:763,798,825` (padding classes)

**Step 1: 헤더 패딩**

`src/components/Terminal.tsx` 763행:

```tsx
/* Before */
<div className="w-full max-w-3xl px-6 flex items-center justify-between">

/* After */
<div className="w-full max-w-3xl px-4 sm:px-6 flex items-center justify-between">
```

**Step 2: 콘텐츠 패딩**

`src/components/Terminal.tsx` 798행:

```tsx
/* Before */
<div className="w-full max-w-3xl px-6 py-6 space-y-1.5">

/* After (space-y-1.5는 Task 1에서 이미 적용됨) */
<div className="w-full max-w-3xl px-4 sm:px-6 py-6 space-y-1.5">
```

**Step 3: 푸터 패딩**

`src/components/Terminal.tsx` 825행:

```tsx
/* Before */
<div className="w-full max-w-3xl px-6 py-3">

/* After */
<div className="w-full max-w-3xl px-4 sm:px-6 py-3">
```

**Step 4: 로컬 확인**

Run: `cd /tmp/example_02 && npm run dev`

브라우저 DevTools에서 320px, 375px, 640px+ 세 가지 뷰포트 확인:
- 320px에서 콘텐츠가 넉넉하게 보이는지
- 375px에서 자연스러운지
- 640px+에서 기존 px-6과 동일한지
- 헤더/콘텐츠/푸터 패딩이 일관되는지

**Step 5: Commit**

```bash
git add src/components/Terminal.tsx
git commit -m "reduce mobile padding: px-6 → px-4 on small screens"
```

---

## Task 5: CRT 스캔라인 효과 강화

현재 opacity 0.03은 Retina에서 거의 안 보임. 분위기를 살리면서 가독성은 해치지 않는 수준으로 강화.

**Files:**
- Modify: `src/app/globals.css:113-121` (scanline opacity and flicker)

**Step 1: 스캔라인 opacity 강화**

`src/app/globals.css` 113-121행:

```css
/* Before */
.scanlines {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.03) 0px,
    rgba(0, 0, 0, 0.03) 1px,
    transparent 1px,
    transparent 2px
  );
  animation: scanline-flicker 4s ease-in-out infinite;
}

/* After */
.scanlines {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.06) 0px,
    rgba(0, 0, 0, 0.06) 1px,
    transparent 1px,
    transparent 2px
  );
  animation: scanline-flicker 5s ease-in-out infinite;
}
```

**Step 2: 플리커 범위 확대**

`src/app/globals.css` 123-126행:

```css
/* Before */
@keyframes scanline-flicker {
  0%, 100% { opacity: 0.95; }
  50% { opacity: 1; }
}

/* After */
@keyframes scanline-flicker {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 1; }
}
```

**Step 3: 로컬 확인**

Run: `cd /tmp/example_02 && npm run dev`

확인 항목:
- 스캔라인이 은은하게 보이는지 (너무 강하면 글 읽기 어려움)
- 플리커가 자연스럽게 느껴지는지
- 밝은 텍스트(accent color)에서 간섭이 없는지

**Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "strengthen CRT scanline effect: 0.03 → 0.06 opacity, wider flicker range"
```

---

## Task 6: AI 채팅 예시 질문 가이드

현재 "아무 질문이나 입력하세요"만 있어 사용자가 뭘 물어야 할지 모름. 예시 질문을 보여줘서 참여를 유도.

**Files:**
- Modify: `src/components/Terminal.tsx:299-302` (home section lines에 예시 추가)

**Step 1: AI 채팅 가이드에 예시 질문 추가**

`src/components/Terminal.tsx` — `showHome` 함수 내 homeLines 배열. 기존 AI 안내 줄(~301행) 교체:

```tsx
/* Before */
{ type: "muted", content: "💬 아무 질문이나 입력하면 AI가 포트폴리오 기반으로 답변합니다 (10회/시간)" },

/* After */
{ type: "muted", content: "💬 AI에게 질문해보세요 (10회/시간)" },
{ type: "muted", content: "   예: \"가장 어려웠던 프로젝트는?\" \"DeFi 경험이 있나요?\" \"강점이 뭔가요?\"" },
```

**Step 2: 로컬 확인**

Run: `cd /tmp/example_02 && npm run dev`

확인 항목:
- Home 섹션 하단에 예시 질문이 자연스럽게 보이는지
- 예시 질문이 너무 길어서 줄바꿈되지 않는지 (모바일 포함)
- 예시를 복사해서 바로 입력해볼 수 있는지

**Step 3: Commit**

```bash
git add src/components/Terminal.tsx
git commit -m "add AI chat example questions to home section"
```

---

## Task 7: 최종 확인 및 배포

**Step 1: 전체 빌드 확인**

```bash
cd /tmp/example_02 && npm run build
```

빌드 에러 없이 성공하는지 확인.

**Step 2: 전체 push**

```bash
git push
```

Cloudflare Pages 자동 배포 트리거됨.

**Step 3: 배포 후 확인**

`https://example-02.pages.dev/` 에서:
- 데스크톱: 간격, 팔레트 자동 표시, 스캔라인, AI 예시 질문
- 모바일(DevTools 375px): 터치 타겟, 패딩, 팔레트 전폭
- AI 질문 실제 테스트 1회
