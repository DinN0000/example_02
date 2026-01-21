"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { portfolio } from "@/data/portfolio";

type Section = "intro" | "home" | "work" | "work-detail" | "fun" | "fun-detail" | "resume";

interface TerminalLine {
  type: "command" | "output" | "ascii" | "system" | "menu" | "divider";
  content: string;
  isNew?: boolean;
}

const COMMANDS = ["home", "work", "fun", "resume", "clear", "help"];

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

  const askClaude = useCallback(async (question: string) => {
    setIsLoading(true);
    setLines(prev => [
      ...prev,
      { type: "command", content: `$ ${question}` },
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
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  const addLines = useCallback((newLines: TerminalLine[], callback?: () => void) => {
    setIsTyping(true);
    let index = 0;

    const addNextLine = () => {
      if (index < newLines.length) {
        setLines(prev => [...prev, { ...newLines[index], isNew: true }]);
        index++;
        setTimeout(addNextLine, newLines[index - 1]?.type === "ascii" ? 10 : 30);
      } else {
        setIsTyping(false);
        callback?.();
      }
    };

    addNextLine();
  }, []);

  const showIntro = useCallback(() => {
    const introLines: TerminalLine[] = [
      { type: "system", content: "$ ssh visitor@portfolio.dev" },
      { type: "system", content: "Connecting to portfolio.dev..." },
      { type: "system", content: "✓ Connection established" },
      { type: "system", content: `[system] next 16.1.1 | react 19.2.3 | ${portfolio.profile.role}` },
      { type: "output", content: "" },
    ];
    addLines(introLines, () => {
      setTimeout(() => showHome(), 500);
    });
  }, [addLines]);

  const showHome = useCallback(() => {
    setCurrentSection("home");
    const homeLines: TerminalLine[] = [
      { type: "command", content: "$ cat home.md" },
      { type: "output", content: "" },
      { type: "output", content: `✱ ${portfolio.home.tagline}` },
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

  const showWork = useCallback(() => {
    setCurrentSection("work");
    setShowMenu(false);
    const workLines: TerminalLine[] = [
      { type: "command", content: "$ cat work.md" },
      { type: "ascii", content: portfolio.work.asciiArt },
      { type: "output", content: "" },
      { type: "output", content: portfolio.work.description },
      { type: "output", content: "" },
      { type: "divider", content: "──────────────────────────────────────────────────" },
      { type: "output", content: "" },
    ];

    portfolio.work.projects.forEach((project, index) => {
      workLines.push(
        { type: "output", content: `${index + 1}. ${project.title}` },
        { type: "output", content: `   ${project.period} | ${project.role}` },
        { type: "output", content: `   ${project.summary}` },
        { type: "output", content: `   [${project.tags.join(", ")}]` },
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
    setShowMenu(false);

    const detailLines: TerminalLine[] = [
      { type: "command", content: `$ cat work/${project.slug}.md` },
      { type: "output", content: "" },
      { type: "output", content: `# ${project.title}` },
      { type: "output", content: "" },
      { type: "output", content: `📅 ${project.period}` },
      { type: "output", content: `👤 ${project.role}` },
      { type: "output", content: "" },
      { type: "divider", content: "──────────────────────────────────────────────────" },
      { type: "output", content: "" },
      ...project.description.map(line => ({ type: "output" as const, content: line })),
      { type: "output", content: "" },
      { type: "output", content: `🏷️  ${project.tags.join(" · ")}` },
    ];

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
    setShowMenu(false);
    const funLines: TerminalLine[] = [
      { type: "command", content: "$ cat fun.md" },
      { type: "ascii", content: portfolio.fun.asciiArt },
      { type: "output", content: "" },
      { type: "output", content: portfolio.fun.description },
      { type: "output", content: "" },
      { type: "divider", content: "──────────────────────────────────────────────────" },
      { type: "output", content: "" },
    ];

    portfolio.fun.projects.forEach((project, index) => {
      funLines.push(
        { type: "output", content: `${index + 1}. ${project.title}` },
        { type: "output", content: `   ${project.summary}` },
        ...project.description.map(line => ({ type: "output" as const, content: `   ${line}` })),
      );
      if (project.link) {
        funLines.push({ type: "output", content: `   → ${project.link} ↗` });
      }
      funLines.push({ type: "output", content: "" });
    });

    addLines(funLines, () => setShowMenu(true));
  }, [addLines]);

  const showResume = useCallback(() => {
    setCurrentSection("resume");
    setShowMenu(false);
    const resumeLines: TerminalLine[] = [
      { type: "command", content: "$ cat resume.md" },
      { type: "ascii", content: portfolio.resume.asciiArt },
      { type: "output", content: "" },
      { type: "output", content: "## Experience" },
      { type: "output", content: "" },
    ];

    portfolio.resume.experience.forEach(exp => {
      resumeLines.push(
        { type: "output", content: `● ${exp.period}` },
        { type: "output", content: `  ${exp.company} — ${exp.role}` },
        { type: "output", content: `  ${exp.description}` },
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
        { type: "output", content: `● ${edu.period}` },
        { type: "output", content: `  ${edu.school} — ${edu.major}` },
        { type: "output", content: `  ${edu.description}` },
        { type: "output", content: "" },
      );
    });

    resumeLines.push(
      { type: "divider", content: "──────────────────────────────────────────────────" },
      { type: "output", content: "" },
      { type: "output", content: "## Skills" },
      { type: "output", content: "" },
      { type: "output", content: `Product: ${portfolio.resume.skills.product.join(" · ")}` },
      { type: "output", content: `Tools: ${portfolio.resume.skills.tools.join(" · ")}` },
      { type: "output", content: `Soft: ${portfolio.resume.skills.soft.join(" · ")}` },
      { type: "output", content: "" },
      { type: "divider", content: "──────────────────────────────────────────────────" },
      { type: "output", content: "" },
      { type: "output", content: `📧 ${portfolio.profile.email}` },
      { type: "output", content: `🔗 ${portfolio.profile.github}` },
      { type: "output", content: `💼 ${portfolio.profile.linkedin}` },
    );

    addLines(resumeLines, () => setShowMenu(true));
  }, [addLines]);

  const showHelp = useCallback(() => {
    setShowMenu(false);
    const helpLines: TerminalLine[] = [
      { type: "command", content: "$ help" },
      { type: "output", content: "" },
      { type: "output", content: "사용 가능한 명령어:" },
      { type: "output", content: "" },
      { type: "output", content: "  home     홈으로 이동" },
      { type: "output", content: "  work     프로젝트 보기" },
      { type: "output", content: "  fun      사이드 프로젝트" },
      { type: "output", content: "  resume   이력서" },
      { type: "output", content: "  clear    화면 초기화" },
      { type: "output", content: "  help     도움말" },
      { type: "output", content: "" },
      { type: "output", content: "또는 자유롭게 질문을 입력하세요." },
    ];
    addLines(helpLines, () => setShowMenu(true));
  }, [addLines]);

  const handleCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();

    if (trimmed === "clear") {
      setLines([]);
      setShowMenu(false);
      showIntro();
      return;
    }

    if (trimmed === "help") {
      showHelp();
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
  }, [currentSection, showIntro, showHome, showWork, showWorkDetail, showFun, showResume, showHelp, askClaude]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || isLoading) return;
    handleCommand(input);
    setInput("");
  };

  const handleMenuClick = (cmd: string) => {
    if (isTyping) return;
    handleCommand(cmd);
  };

  useEffect(() => {
    showIntro();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isTyping]);

  const renderLine = (line: TerminalLine, index: number) => {
    switch (line.type) {
      case "command":
        return (
          <div key={index} className="text-accent">
            {line.content}
          </div>
        );
      case "ascii":
        return (
          <pre key={index} className="text-accent text-xs leading-none whitespace-pre overflow-x-auto">
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
          <div key={index} className="text-border">
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
    <div className="min-h-screen bg-background flex flex-col font-mono">
      {/* Status Bar */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-2 flex justify-between items-center text-sm">
        <span className="text-muted">
          visitor@portfolio <span className="text-accent">~</span>
        </span>
        <div className="flex gap-4 text-muted">
          <span>PROJECTS: <span className="text-accent">{portfolio.metrics.projects}</span></span>
          <span>EXP: <span className="text-accent">{portfolio.metrics.exp}</span></span>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-1"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, index) => renderLine(line, index))}
      </div>

      {/* Menu */}
      {showMenu && !isTyping && (
        <div className="px-4 md:px-8 pb-2 flex flex-wrap gap-2">
          <button
            onClick={() => handleMenuClick("home")}
            className="text-sm text-muted hover:text-accent transition-colors"
          >
            → home
          </button>
          <button
            onClick={() => handleMenuClick("work")}
            className="text-sm text-muted hover:text-accent transition-colors"
          >
            → work
          </button>
          <button
            onClick={() => handleMenuClick("fun")}
            className="text-sm text-muted hover:text-accent transition-colors"
          >
            → fun
          </button>
          <button
            onClick={() => handleMenuClick("resume")}
            className="text-sm text-muted hover:text-accent transition-colors"
          >
            → resume
          </button>
        </div>
      )}

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="text-accent">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping || isLoading}
            placeholder={isLoading ? "생각 중..." : isTyping ? "" : "명령어 또는 질문을 입력하세요..."}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted"
            autoComplete="off"
            spellCheck={false}
          />
          <span className={`text-accent ${isTyping || isLoading ? "" : "cursor-blink"}`}>▋</span>
        </form>
      </div>
    </div>
  );
}
