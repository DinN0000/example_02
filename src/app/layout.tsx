import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import VisitorTracker from "@/components/VisitorTracker";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "이종화 | Product Owner Portfolio",
  description: "블록체인·핀테크 도메인의 Product Owner. 스테이블코인 플랫폼, MPC 지갑, AI 로보어드바이저 등 주요 프로젝트 포트폴리오.",
  openGraph: {
    title: "이종화 | Product Owner Portfolio",
    description: "고복잡도 시장의 어려운 문제에서 기회를 발견하고, 제품으로 풀어내는 Product Owner.",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary",
    title: "이종화 | Product Owner Portfolio",
    description: "블록체인·핀테크 도메인의 Product Owner 포트폴리오.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" dir="ltr">
      <body className={`${jetbrainsMono.variable} antialiased`}>
        <VisitorTracker />
        {children}
      </body>
    </html>
  );
}
