"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { portfolio } from "@/data/portfolio";

type Section = "intro" | "home" | "work" | "work-detail" | "fun" | "fun-detail" | "resume";

interface TerminalLine {
  type: "command" | "output" | "ascii" | "system" | "menu" | "divider" | "section-title" | "highlight";
  content: string;
}

const MENU_ITEMS = [
  { key: "0", cmd: "home", label: "/home" },
  { key: "1", cmd: "about", label: "/about" },
  { key: "2", cmd: "work", label: "/work" },
  { key: "3", cmd: "fun", label: "/fun" },
  { key: "4", cmd: "resume", label: "/resume" },
];

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
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

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
    setIsLoading(true);
    setShowMenu(false);
    setLines(prev => [
      ...prev,
      { type: "command", content: `> ${question}` },
      { type: "system", content: "[thinking...]" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });

      const data = await response.json();

      setLines(prev => {
        const newLines = prev.slice(0, -1);
        return [
          ...newLines,
          { type: "output", content: "" },
          { type: "output", content: data.response || data.error || "응답을 받지 못했습니다." },
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
    showLoadingBar("home.md", () => {
      const homeLines: TerminalLine[] = [
        { type: "command", content: `user@portfolio:~$ cat home.md` },
        { type: "highlight", content: `✱` },
        { type: "section-title", content: `## ${portfolio.home.tagline}` },
        { type: "ascii", content: portfolio.home.asciiArt },
        ...portfolio.home.intro.map(line => ({ type: "output" as const, content: line })),
        { type: "divider", content: "──────────────────────────────────────────────────" },
        ...portfolio.home.highlights.flatMap(item => [
          { type: "highlight" as const, content: `● ${item.title}` },
          { type: "output" as const, content: `  ${item.desc}` },
        ]),
        { type: "output", content: "" },
        { type: "system", content: `[system] vibe-coded by ${portfolio.profile.name} × Claude` },
      ];
      addLines(homeLines, () => setShowMenu(true));
    });
  }, [addLines, showLoadingBar]);

  const showIntro = useCallback(() => {
    const introLines: TerminalLine[] = [
      { type: "system", content: `$ ssh visitor@portfolio.dev` },
      { type: "system", content: "Connecting to portfolio.dev..." },
      { type: "system", content: "✓ Connection established" },
      { type: "system", content: `[system] next 16.1.1 | react 19.2.3 | ${portfolio.profile.role}` },
      { type: "output", content: "" },
    ];
    addLines(introLines, () => {
      setShowPressEnter(true);
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
    setCurrentSection("home"); // reuse home section state
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

      addLines(aboutLines, () => setShowMenu(true));
    });
  }, [addLines, showLoadingBar]);

  const showWork = useCallback(() => {
    setCurrentSection("work");
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

      addLines(workLines, () => setShowMenu(true));
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
        detailLines.push({ type: "output", content: `→ ${project.link} ↗` });
      }

      addLines(detailLines, () => setShowMenu(true));
    });
  }, [addLines, showLoadingBar]);

  const showFun = useCallback(() => {
    setCurrentSection("fun");
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
          funLines.push({ type: "system", content: `→ ${project.link} ↗` });
        }
        funLines.push({ type: "output", content: "" });
      });

      addLines(funLines, () => setShowMenu(true));
    });
  }, [addLines, showLoadingBar]);

  const showResume = useCallback(() => {
    setCurrentSection("resume");
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
        { type: "output", content: `🔗 ${portfolio.profile.github}` },
        { type: "output", content: `💼 ${portfolio.profile.linkedin}` },
      );

      addLines(resumeLines, () => setShowMenu(true));
    });
  }, [addLines, showLoadingBar]);

  const handleCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();

    if (trimmed === "" && showMenu) {
      return;
    }

    if (trimmed === "clear") {
      setLines([]);
      setShowMenu(false);
      setShowPressEnter(false);
      setIntroComplete(false);
      showIntro();
      return;
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

    if (trimmed === "home") {
      setLines(prev => [...prev, { type: "output", content: "" }]);
      showHome();
      return;
    }

    if (trimmed === "about") {
      setLines(prev => [...prev, { type: "output", content: "" }]);
      showAbout();
      return;
    }

    if (trimmed === "work") {
      setLines(prev => [...prev, { type: "output", content: "" }]);
      showWork();
      return;
    }

    if (trimmed === "fun") {
      setLines(prev => [...prev, { type: "output", content: "" }]);
      showFun();
      return;
    }

    if (trimmed === "resume") {
      setLines(prev => [...prev, { type: "output", content: "" }]);
      showResume();
      return;
    }

    // Check for project number in work section
    if (currentSection === "work" || currentSection === "work-detail") {
      const num = parseInt(trimmed);
      if (num >= 1 && num <= portfolio.work.projects.length) {
        setLines(prev => [...prev, { type: "output", content: "" }]);
        showWorkDetail(portfolio.work.projects[num - 1].slug);
        return;
      }
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
          <div key={index} className={`text-border/60 select-none ${baseAnimation}`}>
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
          <div key={index} className={`text-section-title font-semibold text-lg mt-2 ${baseAnimation}`}>
            <span className="text-highlight-orange mr-2">##</span>
            {line.content.replace(/^##\s*/, '')}
          </div>
        );
      case "highlight":
        return (
          <div key={index} className={`text-highlight-cyan ${baseAnimation}`}>
            {line.content}
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
        <header className="h-14 shrink-0 bg-card border-b border-border flex items-center justify-center">
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
              <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs glow-cyan">
                ★ where ideas become products.
              </span>
            </div>
            
            {/* Stats & Clock */}
            <div className="flex items-center gap-4 text-muted text-xs">
              <span className="hidden sm:inline">PROJECTS: <span className="text-highlight-cyan glow-cyan">{portfolio.metrics.projects}</span></span>
              <span className="hidden sm:inline">EXP: <span className="text-highlight-orange glow-orange">{portfolio.metrics.exp}</span></span>
              <span className="text-accent font-medium glow-cyan">{currentTime}</span>
            </div>
          </div>
        </header>

        {/* 콘텐츠 - 스크롤 가능 */}
        <main
          ref={terminalRef}
          className="flex-1 overflow-y-auto overflow-x-hidden flex justify-center"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="w-full max-w-3xl px-6 py-6 space-y-0.5">
            {lines.map((line, index) => renderLine(line, index))}
            
            {/* Press Enter to continue */}
            {showPressEnter && (
              <div className="mt-8 text-center fade-in">
                <span className="text-accent glow-cyan cursor-blink-text">
                  [ Press Enter to continue ]
                </span>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>
        </main>

        {/* 메뉴 */}
        {showMenu && !isTyping && introComplete && (
          <nav className="shrink-0 border-t border-border bg-card/50 flex justify-center">
            <div className="w-full max-w-3xl px-6 py-3">
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {MENU_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleMenuClick(item.cmd)}
                    className="text-muted hover:text-accent transition-colors"
                  >
                    <span className="text-accent">[{item.key}]</span> {item.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        )}

        {/* 푸터 */}
        <footer className="h-14 shrink-0 bg-card border-t border-border flex items-center justify-center">
          <div className="w-full max-w-3xl px-6">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <span className="text-accent select-none glow-cyan">&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping || isLoading || showPressEnter}
                placeholder={
                  showPressEnter 
                    ? "Enter를 눌러 계속하세요..." 
                    : isLoading 
                      ? "thinking..." 
                      : "명령어를 입력하세요..."
                }
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted/50 text-sm"
                autoComplete="off"
                spellCheck={false}
              />
              <span className={`text-accent select-none ${isTyping || isLoading ? "pulse" : "cursor-blink"}`}>▋</span>
            </form>
          </div>
        </footer>
      </div>
    </div>
  );
}
