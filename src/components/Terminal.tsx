"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { portfolio } from "@/data/portfolio";

type Section = "intro" | "home" | "about" | "work" | "work-detail" | "fun" | "resume";

interface TerminalLine {
  type: "command" | "output" | "ascii" | "system" | "menu" | "divider" | "section-title" | "highlight" | "muted" | "tagline" | "link";
  content: string;
  href?: string;
}

const MENU_ITEMS = [
  { key: "0", cmd: "home", label: "/home", desc: "Back to Home" },
  { key: "1", cmd: "about", label: "/about", desc: "About Me" },
  { key: "2", cmd: "work", label: "/work", desc: "Work Projects" },
  { key: "3", cmd: "fun", label: "/fun", desc: "Side Projects" },
  { key: "4", cmd: "resume", label: "/resume", desc: "Resume" },
];

// Client-side rate limiting
const CHAT_LIMIT = 10;
const CHAT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getChatUsage(): { count: number; resetAt: number } {
  try {
    const stored = localStorage.getItem("chat_usage");
    if (!stored) return { count: 0, resetAt: Date.now() + CHAT_WINDOW_MS };
    const data = JSON.parse(stored);
    if (Date.now() > data.resetAt) return { count: 0, resetAt: Date.now() + CHAT_WINDOW_MS };
    return data;
  } catch {
    return { count: 0, resetAt: Date.now() + CHAT_WINDOW_MS };
  }
}

function incrementChatUsage() {
  const usage = getChatUsage();
  usage.count++;
  if (usage.count === 1) usage.resetAt = Date.now() + CHAT_WINDOW_MS;
  localStorage.setItem("chat_usage", JSON.stringify(usage));
}

function getChatRemaining(): number {
  return Math.max(0, CHAT_LIMIT - getChatUsage().count);
}

export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [currentSection, setCurrentSection] = useState<Section>("intro");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [showPressEnter, setShowPressEnter] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Section to palette index mapping
  const sectionToIndex: Record<string, number> = {
    home: 0,
    about: 1,
    work: 2,
    fun: 3,
    resume: 4,
  };

  // Real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'instant', block: 'end' });
    }
  }, []);

  const askClaude = useCallback(async (question: string) => {
    // Client-side rate limit check
    if (getChatRemaining() <= 0) {
      setLines(prev => [
        ...prev,
        { type: "command", content: `> ${question}` },
        { type: "system", content: "[제한] AI 채팅 한도(시간당 10회)를 초과했습니다. 잠시 후 다시 시도해주세요." },
      ]);
      setShowMenu(true);
      return;
    }

    setIsLoading(true);
    setShowMenu(false);
    setLines(prev => [
      ...prev,
      { type: "command", content: `> ${question}` },
      { type: "system", content: "[thinking...]" },
    ]);

    try {
      const apiUrl = "/api/chat";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });

      const data = await response.json();

      if (response.status === 429) {
        setLines(prev => {
          const newLines = prev.slice(0, -1);
          return [
            ...newLines,
            { type: "output", content: "" },
            { type: "system", content: "[제한] AI 채팅 한도를 초과했습니다. 1시간 후 다시 시도해주세요." },
          ];
        });
        return;
      }

      incrementChatUsage();
      const remaining = getChatRemaining();

      setLines(prev => {
        const newLines = prev.slice(0, -1);
        return [
          ...newLines,
          { type: "output", content: "" },
          { type: "output", content: data.response || data.error || "응답을 받지 못했습니다." },
          { type: "muted", content: `[남은 질문: ${remaining}/${CHAT_LIMIT}]` },
        ];
      });
    } catch {
      setLines(prev => {
        const newLines = prev.slice(0, -1);
        return [
          ...newLines,
          { type: "output", content: "" },
          { type: "system", content: "[오류] AI 응답을 가져오는데 실패했습니다." },
        ];
      });
    } finally {
      setIsLoading(false);
      setShowMenu(true);
    }
  }, []);

  const addLines = useCallback((newLines: TerminalLine[], callback?: () => void) => {
    setIsTyping(true);
    setShowMenu(false);
    let index = 0;

    const getDelay = (line: TerminalLine, nextLine?: TerminalLine): number => {
      const type = line?.type;
      const nextType = nextLine?.type;
      
      // ASCII art: faster but still smooth
      if (type === "ascii") return 25;
      
      // Commands feel snappy
      if (type === "command") return 50;
      
      // System messages: quick
      if (type === "system") return 45;
      
      // Dividers: slight pause before/after
      if (type === "divider") return 80;
      
      // Empty lines: quick
      if (!line?.content || line.content === "" || line.content === "\u00A0") return 30;
      
      // If next line is same type, keep rhythm
      if (nextType === type) return 55;
      
      // Content lines: natural typing pace based on length
      const contentLength = line?.content?.length || 0;
      const baseDelay = 60;
      const lengthBonus = Math.min(contentLength * 0.5, 40);
      
      return baseDelay + lengthBonus;
    };

    const addNextLine = () => {
      if (index < newLines.length) {
        const currentLine = newLines[index];
        const nextLine = newLines[index + 1];
        setLines(prev => [...prev, currentLine]);
        index++;
        // Auto-scroll after each line is added
        requestAnimationFrame(() => {
          scrollToBottom();
        });
        const delay = getDelay(currentLine, nextLine);
        setTimeout(addNextLine, delay);
      } else {
        setIsTyping(false);
        callback?.();
      }
    };

    addNextLine();
  }, [scrollToBottom]);

  // Loading bar animation function
  const showLoadingBar = useCallback((filename: string, callback: () => void) => {
    setIsTyping(true);
    setShowMenu(false);
    
    const totalSteps = 20;
    const filledChar = "█";
    const emptyChar = "░";
    let step = 0;
    
    // Add initial loading line
    const loadingLineIndex = { current: -1 };
    
    setLines(prev => {
      loadingLineIndex.current = prev.length;
      return [...prev, { type: "system", content: `Loading ${filename}... ${emptyChar.repeat(totalSteps)} 0%` }];
    });
    
    const updateProgress = () => {
      step++;
      const filled = filledChar.repeat(step);
      const empty = emptyChar.repeat(totalSteps - step);
      const percent = Math.round((step / totalSteps) * 100);
      
      setLines(prev => {
        const newLines = [...prev];
        if (loadingLineIndex.current >= 0 && loadingLineIndex.current < newLines.length) {
          newLines[loadingLineIndex.current] = {
            type: "system",
            content: `Loading ${filename}... ${filled}${empty} ${percent}%`
          };
        }
        return newLines;
      });
      
      requestAnimationFrame(() => {
        scrollToBottom();
      });
      
      if (step < totalSteps) {
        // Variable speed: slower at start and end, faster in middle
        const progress = step / totalSteps;
        let delay;
        if (progress < 0.2) {
          delay = 60 + Math.random() * 40; // Slow start
        } else if (progress > 0.8) {
          delay = 40 + Math.random() * 30; // Slight slowdown at end
        } else {
          delay = 20 + Math.random() * 25; // Fast middle
        }
        setTimeout(updateProgress, delay);
      } else {
        // Complete - remove loading line and proceed
        setTimeout(() => {
          setLines(prev => prev.slice(0, -1)); // Remove loading bar
          setIsTyping(false);
          callback();
        }, 150);
      }
    };
    
    setTimeout(updateProgress, 100);
  }, [scrollToBottom]);

  const showHome = useCallback(() => {
    setCurrentSection("home");
    setPaletteIndex(0); // 현재 섹션 하이라이트
    showLoadingBar("home.md", () => {
      const homeLines: TerminalLine[] = [
        { type: "command", content: `visitor@portfolio:~$ cat home.md` },
        { type: "output", content: "" },
        { type: "section-title", content: `## HIGHLIGHTS` },
        { type: "output", content: "" },
        ...portfolio.home.highlights.flatMap(item => [
          { type: "highlight" as const, content: `● ${item.title}` },
          { type: "output" as const, content: `  ${item.desc}` },
          { type: "output" as const, content: "" },
        ]),
        { type: "divider", content: "──────────────────────────────────────────────────" },
        { type: "muted", content: "↑ 하이라이트 · 아래 메뉴에서 상세 정보 확인" },
        { type: "muted", content: "💬 아무 질문이나 입력하면 AI가 포트폴리오 기반으로 답변합니다 (10회/시간)" },
      ];
      addLines(homeLines, () => {
        setShowMenu(true);
        setPaletteIndex(1); // 다음 섹션으로
      });
    });
  }, [addLines, showLoadingBar]);

  const showIntro = useCallback(() => {
    const introLines: TerminalLine[] = [
      { type: "system", content: `$ ssh visitor@portfolio.dev` },
      { type: "system", content: "Connecting to portfolio.dev..." },
      { type: "system", content: "✓ Connection established (latency: 12ms)" },
      { type: "muted", content: "[system] next 15.x | react 19.x | seoul-kr" },
      { type: "output", content: "" },
      { type: "command", content: `visitor@portfolio:~$ cat intro.md` },
      { type: "output", content: "" },
      { type: "tagline", content: `✦ ${portfolio.home.tagline}` },
      { type: "output", content: "" },
      { type: "ascii", content: portfolio.home.asciiArt },
      { type: "output", content: "" },
      { type: "divider", content: `── ${portfolio.profile.name} · ${portfolio.profile.role} ──` },
      { type: "output", content: "" },
      { type: "output", content: "규제와 기술이 맞물린 시장에서" },
      { type: "output", content: "불확실성을 구조화하고 제품으로 풀어온" },
      { type: "output", content: "Product Owner 이종화입니다." },
      { type: "output", content: "" },
      { type: "muted", content: "[system] vibe-coded with Claude Code × Opus 4.5" },
      { type: "output", content: "" },
    ];
    addLines(introLines, () => {
      setShowPressEnter(true);
      setPaletteIndex(0); // home 하이라이트
    });
  }, [addLines]);

  // Handle Enter key for intro
  useEffect(() => {
    if (!showPressEnter) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && showPressEnter) {
        setShowPressEnter(false);
        setIntroComplete(true);
        showHome();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPressEnter, showHome]);

  const showAbout = useCallback(() => {
    setCurrentSection("about");
    setPaletteIndex(1); // 현재 섹션 하이라이트
    showLoadingBar("about.md", () => {
      const aboutLines: TerminalLine[] = [
        { type: "command", content: `user@portfolio:~$ cat about.md` },
        { type: "ascii", content: portfolio.about.asciiArt },
        { type: "output", content: "" },
        { type: "section-title", content: `## ${portfolio.about.whoAmI.title}` },
        ...portfolio.about.whoAmI.content.map(line => ({ type: "output" as const, content: line })),
        { type: "divider", content: "──────────────────────────────────────────────────" },
        { type: "section-title", content: `## ${portfolio.about.coreValues.title}` },
        ...portfolio.about.coreValues.content.map(line => ({ type: "output" as const, content: line })),
        { type: "divider", content: "──────────────────────────────────────────────────" },
        { type: "section-title", content: `## ${portfolio.about.strengths.title}` },
      ];

      portfolio.about.strengths.items.forEach(item => {
        aboutLines.push(
          { type: "highlight", content: item.name },
          { type: "output", content: item.description },
        );
      });

      aboutLines.push(
        { type: "output", content: "" },
        { type: "divider", content: "──────────────────────────────────────────────────" },
        { type: "section-title", content: `## ${portfolio.about.background.title}` },
        { type: "highlight", content: `Education` },
      );

      portfolio.about.background.education.forEach(edu => {
        aboutLines.push(
          { type: "output", content: `${edu.period} — ${edu.school}, ${edu.major}` },
        );
      });

      aboutLines.push(
        { type: "output", content: "" },
        { type: "highlight", content: `Career` },
      );

      portfolio.about.background.career.forEach(career => {
        aboutLines.push(
          { type: "output", content: `${career.period} — ${career.company}, ${career.role}` },
        );
      });

      addLines(aboutLines, () => {
        setShowMenu(true);
        setPaletteIndex(2); // 다음 섹션으로
      });
    });
  }, [addLines, showLoadingBar]);

  const showWork = useCallback(() => {
    setCurrentSection("work");
    setPaletteIndex(2); // 현재 섹션 하이라이트
    showLoadingBar("work.md", () => {
      const workLines: TerminalLine[] = [
        { type: "command", content: `user@portfolio:~$ cat work.md` },
        { type: "ascii", content: portfolio.work.asciiArt },
        { type: "output", content: "" },
        { type: "output", content: portfolio.work.description },
        { type: "divider", content: "──────────────────────────────────────────────────" },
      ];

      portfolio.work.projects.forEach((project, index) => {
        workLines.push(
          { type: "highlight", content: `${index + 1}. ${project.title}` },
          { type: "output", content: `${project.period} | ${project.role}` },
          { type: "output", content: project.summary },
          { type: "system", content: `[${project.tags.join(", ")}]` },
          { type: "output", content: "" },
        );
      });

      workLines.push(
        { type: "divider", content: "──────────────────────────────────────────────────" },
        { type: "system", content: "프로젝트 번호를 입력하면 상세 내용을 볼 수 있습니다." },
      );

      addLines(workLines, () => {
        setShowMenu(true);
        setPaletteIndex(3); // 다음 섹션으로
      });
    });
  }, [addLines, showLoadingBar]);

  const showWorkDetail = useCallback((projectSlug: string) => {
    const project = portfolio.work.projects.find(p => p.slug === projectSlug);
    if (!project) return;

    setCurrentSection("work-detail");
    setSelectedProject(projectSlug);

    showLoadingBar(`work/${project.slug}.md`, () => {
      const detailLines: TerminalLine[] = [
        { type: "command", content: `user@portfolio:~$ cat work/${project.slug}.md` },
        { type: "output", content: "" },
        { type: "section-title", content: `## ${project.title}` },
        { type: "output", content: `📅 ${project.period}` },
        { type: "output", content: `👤 ${project.role}` },
        { type: "divider", content: "──────────────────────────────────────────────────" },
      ];

      project.description.forEach(line => {
        detailLines.push({ type: "output", content: line });
      });

      detailLines.push(
        { type: "output", content: "" },
        { type: "output", content: `🏷️  ${project.tags.join(" · ")}` },
      );

      if (project.link) {
        detailLines.push({ type: "link", content: `→ ${project.link} ↗`, href: project.link });
      }

      addLines(detailLines, () => setShowMenu(true));
    });
  }, [addLines, showLoadingBar]);

  const showFun = useCallback(() => {
    setCurrentSection("fun");
    setPaletteIndex(3); // 현재 섹션 하이라이트
    showLoadingBar("fun.md", () => {
      const funLines: TerminalLine[] = [
        { type: "command", content: `user@portfolio:~$ cat fun.md` },
        { type: "ascii", content: portfolio.fun.asciiArt },
        { type: "output", content: "" },
        { type: "output", content: portfolio.fun.description },
        { type: "divider", content: "──────────────────────────────────────────────────" },
      ];

      portfolio.fun.projects.forEach((project, index) => {
        funLines.push(
          { type: "highlight", content: `${index + 1}. ${project.title}` },
          { type: "output", content: project.summary },
        );
        project.description.forEach(line => {
          funLines.push({ type: "output", content: line });
        });
        if (project.link) {
          funLines.push({ type: "link", content: `→ ${project.link} ↗`, href: project.link });
        }
        funLines.push({ type: "output", content: "" });
      });

      addLines(funLines, () => {
        setShowMenu(true);
        setPaletteIndex(4); // 다음 섹션으로
      });
    });
  }, [addLines, showLoadingBar]);

  const showResume = useCallback(() => {
    setCurrentSection("resume");
    setPaletteIndex(4); // 현재 섹션 하이라이트
    showLoadingBar("resume.md", () => {
      const resumeLines: TerminalLine[] = [
        { type: "command", content: `user@portfolio:~$ cat resume.md` },
        { type: "ascii", content: portfolio.resume.asciiArt },
        { type: "output", content: "" },
        { type: "section-title", content: "## Experience" },
      ];

      portfolio.resume.experience.forEach(exp => {
        resumeLines.push(
          { type: "output", content: `${exp.period} | ${exp.company} — ${exp.role}` },
          { type: "output", content: exp.description },
          { type: "output", content: "" },
        );
      });

      resumeLines.push(
        { type: "divider", content: "──────────────────────────────────────────────────" },
        { type: "section-title", content: "## Education" },
      );

      portfolio.resume.education.forEach(edu => {
        resumeLines.push(
          { type: "output", content: `${edu.period} | ${edu.school} — ${edu.major}` },
          { type: "output", content: edu.description },
          { type: "output", content: "" },
        );
      });

      resumeLines.push(
        { type: "divider", content: "──────────────────────────────────────────────────" },
        { type: "section-title", content: "## Skills" },
        { type: "highlight", content: `AI: ${portfolio.resume.skills.ai.join(" · ")}` },
        { type: "highlight", content: `Product: ${portfolio.resume.skills.product.join(" · ")}` },
        { type: "highlight", content: `Tools: ${portfolio.resume.skills.tools.join(" · ")}` },
        { type: "highlight", content: `Domain: ${portfolio.resume.skills.domain.join(" · ")}` },
        { type: "output", content: "" },
        { type: "divider", content: "──────────────────────────────────────────────────" },
        { type: "output", content: `📧 ${portfolio.profile.email}` },
        { type: "output", content: `💼 ${portfolio.profile.linkedin}` },
      );

      addLines(resumeLines, () => {
        setShowMenu(true);
        setPaletteIndex(0); // 처음으로 순환
      });
    });
  }, [addLines, showLoadingBar]);

  const handleCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    // Support both "home" and "/home" formats
    const normalized = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;

    if (trimmed === "" && showMenu) {
      return;
    }

    if (trimmed === "clear") {
      setLines([]);
      setShowMenu(false);
      if (introComplete) {
        showHome();
      } else {
        setShowPressEnter(false);
        showIntro();
      }
      return;
    }

    // Check for project number in work section (before menu selection)
    if (currentSection === "work" || currentSection === "work-detail") {
      const num = parseInt(trimmed);
      if (!isNaN(num) && num >= 1 && num <= portfolio.work.projects.length) {
        setLines(prev => [...prev, { type: "output", content: "" }]);
        showWorkDetail(portfolio.work.projects[num - 1].slug);
        return;
      }
    }

    // Handle numeric menu selection
    const menuItem = MENU_ITEMS.find(item => item.key === trimmed);
    if (menuItem) {
      setLines(prev => [...prev, { type: "output", content: "" }]);
      switch (menuItem.cmd) {
        case "home": showHome(); break;
        case "about": showAbout(); break;
        case "work": showWork(); break;
        case "fun": showFun(); break;
        case "resume": showResume(); break;
      }
      return;
    }

    // Handle text commands (with or without "/" prefix)
    const navCommands: Record<string, () => void> = {
      home: showHome,
      about: showAbout,
      work: showWork,
      fun: showFun,
      resume: showResume,
    };

    if (navCommands[normalized]) {
      setLines(prev => [...prev, { type: "output", content: "" }]);
      navCommands[normalized]();
      return;
    }

    // If not a command, treat as a question for Claude
    askClaude(cmd);
  }, [currentSection, showMenu, showIntro, showHome, showAbout, showWork, showWorkDetail, showFun, showResume, askClaude]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTyping || isLoading) return;

    // Handle intro "Press Enter"
    if (showPressEnter) {
      setShowPressEnter(false);
      setIntroComplete(true);
      showHome();
      return;
    }

    // Empty enter shows/hides menu
    if (!input.trim()) {
      setShowMenu(prev => !prev);
      return;
    }

    handleCommand(input);
    setInput("");
  };

  const handleMenuClick = (cmd: string) => {
    if (isTyping || isLoading) return;
    setInput("");
    handleCommand(cmd);
  };

  useEffect(() => {
    showIntro();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isTyping]);

  const renderLine = (line: TerminalLine, index: number) => {
    if (!line) return null;
    
    const baseAnimation = "type-reveal";
    const asciiAnimation = "ascii-reveal";
    
    switch (line.type) {
      case "command":
        return (
          <div key={index} className={`text-accent font-medium ${baseAnimation}`}>
            {line.content}
          </div>
        );
      case "ascii":
        return (
          <pre key={index} className={`text-accent/80 text-xs sm:text-sm leading-none whitespace-pre overflow-x-auto ${asciiAnimation}`}>
            {line.content}
          </pre>
        );
      case "system":
        return (
          <div key={index} className={`text-muted text-sm ${baseAnimation}`}>
            {line.content}
          </div>
        );
      case "divider":
        return (
          <div key={index} className={`text-muted/70 select-none text-sm my-2 ${baseAnimation}`}>
            {line.content}
          </div>
        );
      case "menu":
        return (
          <div key={index} className={`text-accent ${baseAnimation}`}>
            {line.content}
          </div>
        );
      case "section-title":
        return (
          <div key={index} className={`text-section-title font-semibold text-base mt-4 mb-2 ${baseAnimation}`}>
            <span className="text-muted/50 mr-2">##</span>
            {line.content.replace(/^##\s*/, '')}
          </div>
        );
      case "highlight":
        return (
          <div key={index} className={`text-highlight-cyan ${baseAnimation}`}>
            {line.content}
          </div>
        );
      case "muted":
        return (
          <div key={index} className={`text-muted/60 text-xs ${baseAnimation}`}>
            {line.content}
          </div>
        );
      case "link":
        return (
          <div key={index} className={`${baseAnimation}`}>
            <a
              href={line.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 underline underline-offset-2 text-sm"
            >
              {line.content}
            </a>
          </div>
        );
      case "tagline":
        return (
          <div key={index} className={`${baseAnimation}`}>
            <span className="inline-block px-4 py-2 border border-accent/40 rounded text-accent text-sm">
              {line.content}
            </span>
          </div>
        );
      default:
        return (
          <div key={index} className={`text-foreground ${baseAnimation}`}>
            {line.content || "\u00A0"}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black font-mono">
      {/* Scanline overlay */}
      <div className="scanlines" />
      
      {/* 카드 컨테이너 */}
      <div className="absolute inset-3 bg-card rounded-xl border border-border shadow-2xl shadow-black/50 overflow-hidden flex flex-col">
        
        {/* 헤더 */}
        <header className="h-11 shrink-0 bg-card border-b border-border flex items-center justify-center">
          <div className="w-full max-w-3xl px-6 flex items-center justify-between">
            {/* Traffic lights (macOS style) */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/90 hover:bg-red-400 transition-colors" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/90 hover:bg-yellow-400 transition-colors" />
                <div className="w-3 h-3 rounded-full bg-green-500/90 hover:bg-green-400 transition-colors" />
              </div>
              <span className="text-muted text-sm hidden sm:inline">
                {portfolio.profile.name} — portfolio
              </span>
            </div>
            
            {/* Tagline badge */}
            <div className="hidden md:flex items-center">
              <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs">
                ★ where ideas become products.
              </span>
            </div>

            {/* Stats & Clock */}
            <div className="flex items-center gap-4 text-muted text-xs">
              <span className="hidden sm:inline">PROJECTS: <span className="text-highlight-cyan">{portfolio.metrics.projects}</span></span>
              <span className="hidden sm:inline">EXP: <span className="text-highlight-orange">{portfolio.metrics.exp}</span></span>
              <span className="text-accent font-medium glow-accent">{currentTime}</span>
            </div>
          </div>
        </header>

        {/* 콘텐츠 - 스크롤 가능 */}
        <main
          ref={terminalRef}
          className="flex-1 overflow-y-auto overflow-x-hidden flex justify-center"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="w-full max-w-3xl px-6 py-6 space-y-1.5">
            {lines.map((line, index) => renderLine(line, index))}
            
            {/* Press Enter to continue */}
            {showPressEnter && (
              <div className="mt-8 text-center fade-in">
                <button
                  type="button"
                  onClick={() => {
                    setShowPressEnter(false);
                    setIntroComplete(true);
                    showHome();
                  }}
                  className="text-accent glow-cyan cursor-blink-text hover:opacity-80 transition-opacity"
                >
                  <span className="hidden sm:inline">[ Press Enter to continue ]</span>
                  <span className="sm:hidden">[ Tap to continue ]</span>
                </button>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>
        </main>

        {/* 푸터 */}
        <footer className="shrink-0 bg-card border-t border-border flex items-center justify-center relative">
          <div className="w-full max-w-3xl px-6 py-3">
            {/* Command Palette - 인풋 포커스 시 표시 */}
            {isFocused && introComplete && !isTyping && !isLoading && !showPressEnter && (
              <div className="fade-in absolute bottom-full right-6 mb-3 w-72 bg-card border border-border rounded-lg overflow-hidden shadow-lg shadow-black/30">
                {/* Header */}
                <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <span className="text-muted text-[11px]">Select Command</span>
                  <span className="text-muted/50 text-[10px]">↑↓ · ↵</span>
                </div>
                {/* Menu Items */}
                <div className="p-2">
                  {MENU_ITEMS.map((item, index) => {
                    const isSelected = index === paletteIndex;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleMenuClick(item.cmd);
                        }}
                        onMouseEnter={() => setPaletteIndex(index)}
                        className={`w-full px-3 py-2 rounded-md flex items-center text-left transition-colors duration-100 ${
                          isSelected ? 'bg-accent/15' : 'bg-transparent'
                        }`}
                      >
                        <span className={`w-7 text-[11px] font-mono ${isSelected ? 'text-accent' : 'text-muted/50'}`}>
                          [{item.key}]
                        </span>
                        <span className={`w-16 text-xs ${isSelected ? 'text-accent' : 'text-foreground'}`}>
                          {item.label}
                        </span>
                        <span className={`text-[11px] ${isSelected ? 'text-accent' : 'text-muted/50'}`}>
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Status bar above input */}
            {introComplete && (
              <div className="flex items-center justify-between mb-2 text-[10px] text-muted/40">
                <div className="flex items-center gap-3">
                  <span>
                    Next: [{MENU_ITEMS[paletteIndex]?.key}] {MENU_ITEMS[paletteIndex]?.label} {MENU_ITEMS[paletteIndex]?.desc}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span>{currentSection === "intro" ? "home" : currentSection}</span>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <span className="text-accent select-none glow-cyan">&gt;</span>
              {!isFocused && !input && (
                <span className={`text-accent select-none ${isTyping || isLoading ? "pulse" : "cursor-blink"}`}>▋</span>
              )}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                  if (!isFocused || !introComplete || isTyping || isLoading || showPressEnter) return;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setPaletteIndex((prev) => (prev + 1) % MENU_ITEMS.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setPaletteIndex((prev) => (prev - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
                  } else if (e.key === 'Enter' && !input.trim()) {
                    e.preventDefault();
                    handleMenuClick(MENU_ITEMS[paletteIndex].cmd);
                    setIsFocused(false);
                    inputRef.current?.blur();
                  }
                }}
                disabled={isTyping || isLoading}
                placeholder={
                  isFocused
                    ? (showPressEnter
                        ? "Enter를 눌러 계속하세요..."
                        : isLoading
                          ? "thinking..."
                          : "메뉴 선택 또는 AI에게 질문하세요...")
                    : ""
                }
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted/50 text-base sm:text-sm text-left"
                style={{ direction: 'ltr', textAlign: 'left', unicodeBidi: 'plaintext' }}
                dir="ltr"
                autoComplete="off"
                spellCheck={false}
              />
              {/* Enter button */}
              <button
                type="submit"
                disabled={isTyping || isLoading}
                className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center bg-accent/15 text-accent hover:bg-accent/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Submit"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 10 4 15 9 20" />
                  <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                </svg>
              </button>
            </form>
          </div>
        </footer>
      </div>
    </div>
  );
}
