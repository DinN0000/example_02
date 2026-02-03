"use client";

import { useState } from "react";
import Terminal from "@/components/Terminal";
import Splash from "@/components/Splash";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  return <Terminal />;
}
