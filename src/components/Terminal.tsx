"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { portfolio } from "@/data/portfolio";

type Section = "intro" | "home" | "work" | "work-detail" | "fun" | "fun-detail" | "resume";

interface TerminalLine {
  type: "command" | "output" | "ascii" | "system" | "menu" | "divider";
  content: string;
}

const MENU_ITEMS = [
  { key: "0", cmd: "home", label: "/home" },
  { key: "1", cmd: "work", label: "/work" },
  { key: "2", cmd: "fun", label: "/fun" },
  { key: "3", cmd: "resume", label: "/resume" },
];

export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [currentSection, setCurrentSection] = useState<Section>("intro");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
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

    const addNextLine = () => {
      if (index < newLines.length) {
        const currentLine = newLines[index];
        const currentType = currentLine?.type;
        setLines(prev => [...prev, currentLine]);
        index++;
        const delay = currentType === "ascii" ? 5 : 40;
        setTimeout(addNextLine, delay);
      } else {
        setIsTyping(false);
        callback?.();
      }
    };

    addNextLine();
  }, []);

  const showHome = useCallback(() => {
    setCurrentSection("home");
    const homeLines: TerminalLine[] = [
      { type: "command", content: `user@portfolio:~$ cat home.md` },
      { type: "output", content: "" },
      { type: "output", content: `✱` },
      { type: "output", content: portfolio.home.tagline },
      { type: "ascii", content: portfolio.home.asciiArt },
      { type: "output", content: "" },
      ...portfolio.home.intro.map(line => ({ type: "output" as const, content: line })),
      { type: "output", content: "" },
      { type: "divider", content: "──────────────────────────────────────────────────" },
      { type: "output", content: "" },
      ...portfolio.home.highlights.map(line => ({ type: "output" as const, content: line })),
      { type: "output", content: "" },
      { type: "system", content: `[system] vibe-coded by ${portfolio.profile.name} × Claude` },
    ];
    addLines(homeLines, () => setShowMenu(true));
  }, [addLines]);

  const showIntro = useCallback(() => {
    const introLines: TerminalLine[] = [
      { type: "system", content: `$ ssh visitor@portfolio.dev` },
      { type: "system", content: "Connecting to portfolio.dev..." },
      { type: "system", content: "✓ Connection established" },
      { type: "system", content: `[system] next 16.1.1 | react 19.2.3 | ${portfolio.profile.role}` },
      { type: "output", content: "" },
    ];
    addLines(introLines, () => {
      setTimeout(() => showHome(), 300);
    });
  }, [addLines, showHome]);

  const showWork = useCallback(() => {
    setCurrentSection("work");
    const workLines: TerminalLine[] = [
      { type: "command", content: `user@portfolio:~$ cat work.md` },
      { type: "ascii", content: portfolio.work.asciiArt },
      { type: "output", content: "" },
      { type: "output", content: portfolio.work.description },
      { type: "output", content: "" },
      { type: "divider", content: "──────────────────────────────────────────────────" },
      { type: "output", content: "" },
    ];

    portfolio.work.projects.forEach((project, index) => {
      workLines.push(
        { type: "output", content: `●` },
        { type: "output", content: `${index + 1}. ${project.title}` },
        { type: "output", content: `●` },
        { type: "output", content: `${project.period} | ${project.role}` },
        { type: "output", content: `●` },
        { type: "output", content: project.summary },
        { type: "output", content: `●` },
        { type: "output", content: `[${project.tags.join(", ")}]` },
        { type: "output", content: "" },
      );
    });

    workLines.push(
      { type: "divider", content: "──────────────────────────────────────────────────" },
      { type: "output", content: "" },
      { type: "system", content: "프로젝트 번호를 입력하면 상세 내용을 볼 수 있습니다." },
    );

    addLines(workLines, () => setShowMenu(true));
  }, [addLines]);

  const showWorkDetail = useCallback((projectSlug: string) => {
    const project = portfolio.work.projects.find(p => p.slug === projectSlug);
    if (!project) return;

    setCurrentSection("work-detail");
    setSelectedProject(projectSlug);

    const detailLines: TerminalLine[] = [
      { type: "command", content: `user@portfolio:~$ cat work/${project.slug}.md` },
      { type: "output", content: "" },
      { type: "output", content: `# ${project.title}` },
      { type: "output", content: "" },
      { type: "output", content: `●` },
      { type: "output", content: `📅 ${project.period}` },
      { type: "output", content: `●` },
      { type: "output", content: `👤 ${project.role}` },
      { type: "output", content: "" },
      { type: "divider", content: "──────────────────────────────────────────────────" },
      { type: "output", content: "" },
    ];

    project.description.forEach(line => {
      detailLines.push(
        { type: "output", content: `●` },
        { type: "output", content: line },
      );
    });

    detailLines.push(
      { type: "output", content: "" },
      { type: "output", content: `●` },
      { type: "output", content: `🏷️  ${project.tags.join(" · ")}` },
    );

    if (project.link) {
      detailLines.push(
        { type: "output", content: "" },
        { type: "output", content: `→ ${project.link} ↗` },
      );
    }

    addLines(detailLines, () => setShowMenu(true));
  }, [addLines]);

  const showFun = useCallback(() => {
    setCurrentSection("fun");
    const funLines: TerminalLine[] = [
      { type: "command", content: `user@portfolio:~$ cat fun.md` },
      { type: "ascii", content: portfolio.fun.asciiArt },
      { type: "output", content: "" },
      { type: "output", content: portfolio.fun.description },
      { type: "output", content: "" },
      { type: "divider", content: "──────────────────────────────────────────────────" },
      { type: "output", content: "" },
    ];

    portfolio.fun.projects.forEach((project, index) => {
      funLines.push(
        { type: "output", content: `●` },
        { type: "output", content: `${index + 1}. ${project.title}` },
        { type: "output", content: `●` },
        { type: "output", content: project.summary },
      );
      project.description.forEach(line => {
        funLines.push(
          { type: "output", content: `●` },
          { type: "output", content: line },
        );
      });
      if (project.link) {
        funLines.push(
          { type: "output", content: `●` },
          { type: "output", content: `→ ${project.link} ↗` },
        );
      }
      funLines.push({ type: "output", content: "" });
    });

    addLines(funLines, () => setShowMenu(true));
  }, [addLines]);

  const showResume = useCallback(() => {
    setCurrentSection("resume");
    const resumeLines: TerminalLine[] = [
      { type: "command", content: `user@portfolio:~$ cat resume.md` },
      { type: "ascii", content: portfolio.resume.asciiArt },
      { type: "output", content: "" },
      { type: "output", content: "## Experience" },
      { type: "output", content: "" },
    ];

    portfolio.resume.experience.forEach(exp => {
      resumeLines.push(
        { type: "output", content: `●` },
        { type: "output", content: exp.period },
        { type: "output", content: `●` },
        { type: "output", content: `${exp.company} — ${exp.role}` },
        { type: "output", content: `●` },
        { type: "output", content: exp.description },
        { type: "output", content: "" },
      );
    });

    resumeLines.push(
      { type: "divider", content: "──────────────────────────────────────────────────" },
      { type: "output", content: "" },
      { type: "output", content: "## Education" },
      { type: "output", content: "" },
    );

    portfolio.resume.education.forEach(edu => {
      resumeLines.push(
        { type: "output", content: `●` },
        { type: "output", content: edu.period },
        { type: "output", content: `●` },
        { type: "output", content: `${edu.school} — ${edu.major}` },
        { type: "output", content: `●` },
        { type: "output", content: edu.description },
        { type: "output", content: "" },
      );
    });

    resumeLines.push(
      { type: "divider", content: "──────────────────────────────────────────────────" },
      { type: "output", content: "" },
      { type: "output", content: "## Skills" },
      { type: "output", content: "" },
      { type: "output", content: `●` },
      { type: "output", content: `Product: ${portfolio.resume.skills.product.join(" · ")}` },
      { type: "output", content: `●` },
      { type: "output", content: `Tools: ${portfolio.resume.skills.tools.join(" · ")}` },
      { type: "output", content: `●` },
      { type: "output", content: `Domain: ${portfolio.resume.skills.domain.join(" · ")}` },
      { type: "output", content: "" },
      { type: "divider", content: "──────────────────────────────────────────────────" },
      { type: "output", content: "" },
      { type: "output", content: `●` },
      { type: "output", content: `📧 ${portfolio.profile.email}` },
      { type: "output", content: `●` },
      { type: "output", content: `🔗 ${portfolio.profile.github}` },
      { type: "output", content: `●` },
      { type: "output", content: `💼 ${portfolio.profile.linkedin}` },
    );

    addLines(resumeLines, () => setShowMenu(true));
  }, [addLines]);

  const handleCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();

    if (trimmed === "" && showMenu) {
      return;
    }

    if (trimmed === "clear") {
      setLines([]);
      setShowMenu(false);
      showIntro();
      return;
    }

    // Handle numeric menu selection
    const menuItem = MENU_ITEMS.find(item => item.key === trimmed);
    if (menuItem) {
      setLines(prev => [...prev, { type: "output", content: "" }]);
      switch (menuItem.cmd) {
        case "home": showHome(); break;
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
  }, [currentSection, showMenu, showIntro, showHome, showWork, showWorkDetail, showFun, showResume, askClaude]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTyping || isLoading) return;

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
    switch (line.type) {
      case "command":
        return (
          <div key={index} className="text-accent font-medium">
            {line.content}
          </div>
        );
      case "ascii":
        return (
          <pre key={index} className="text-accent text-[10px] sm:text-xs leading-none whitespace-pre overflow-x-auto">
            {line.content}
          </pre>
        );
      case "system":
        return (
          <div key={index} className="text-muted text-sm">
            {line.content}
          </div>
        );
      case "divider":
        return (
          <div key={index} className="text-border select-none">
            {line.content}
          </div>
        );
      case "menu":
        return (
          <div key={index} className="text-accent">
            {line.content}
          </div>
        );
      default:
        return (
          <div key={index} className="text-foreground">
            {line.content || "\u00A0"}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center font-mono">
      {/* Status Bar */}
      <header className="sticky top-0 z-10 w-full bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-3 flex justify-between items-center text-sm">
          <span className="text-foreground">
            {portfolio.profile.name} — <span className="text-muted">portfolio</span>
          </span>
          <div className="flex gap-6 text-muted">
            <span>PROJECTS: <span className="text-accent">{portfolio.metrics.projects}</span></span>
            <span>EXP: <span className="text-accent">{portfolio.metrics.exp}</span></span>
          </div>
        </div>
      </header>

      {/* Terminal Output */}
      <main
        ref={terminalRef}
        className="flex-1 w-full overflow-y-auto"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-0.5">
          {lines.map((line, index) => renderLine(line, index))}
        </div>
      </main>

      {/* Menu */}
      {showMenu && !isTyping && (
        <nav className="w-full border-t border-border bg-card/50">
          <div className="max-w-4xl mx-auto px-6 py-4">
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

      {/* Input */}
      <footer className="sticky bottom-0 w-full bg-background border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <span className="text-accent select-none">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping || isLoading}
              placeholder={isLoading ? "thinking..." : "명령어를 입력하세요..."}
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted/50"
              autoComplete="off"
              spellCheck={false}
            />
            <span className={`text-accent select-none ${isTyping || isLoading ? "pulse" : "cursor-blink"}`}>▋</span>
          </form>
        </div>
      </footer>
    </div>
  );
}
