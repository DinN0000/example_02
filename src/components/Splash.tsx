"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface SplashProps {
  onComplete: () => void;
}

const INIT_LINES = [
  { text: "> Initializing system...", delay: 0 },
  { text: "> Loading portfolio data...", delay: 400 },
  { text: "> Establishing connection...", delay: 800 },
  { text: "> Welcome to Jong-hwa's terminal", delay: 1200 },
  { text: "", delay: 1600 },
];

export default function Splash({ onComplete }: SplashProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [showEnter, setShowEnter] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Show lines one by one
    INIT_LINES.forEach((line, index) => {
      setTimeout(() => {
        setVisibleLines(index + 1);
      }, line.delay);
    });

    // Show "Press Enter" after all lines
    setTimeout(() => {
      setShowEnter(true);
    }, 1800);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && showEnter) {
        handleExit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showEnter]);

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleClick = () => {
    if (showEnter) {
      handleExit();
    }
  };

  return (
    <div
      className={`min-h-screen bg-black flex flex-col items-center justify-center p-4 cursor-pointer transition-opacity duration-300 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClick}
    >
      {/* Robot Image */}
      <div className="mb-8 animate-float">
        <Image
          src="/robot.png"
          alt="Pixel Robot"
          width={150}
          height={150}
          className="pixelated"
          priority
        />
      </div>

      {/* Terminal-style init text */}
      <div className="font-mono text-sm md:text-base space-y-1 text-center max-w-md">
        {INIT_LINES.slice(0, visibleLines).map((line, index) => (
          <div
            key={index}
            className={`${
              index === 3 ? "text-green-400" : "text-gray-400"
            } animate-fadeIn`}
          >
            {line.text}
            {index === visibleLines - 1 && index < INIT_LINES.length - 1 && (
              <span className="animate-pulse">_</span>
            )}
          </div>
        ))}
      </div>

      {/* Press Enter prompt */}
      {showEnter && (
        <div className="mt-8 text-gray-500 font-mono text-sm animate-pulse">
          Press Enter or tap to continue
        </div>
      )}
    </div>
  );
}
