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
  description: "규제와 기술이 맞물린 시장에서 불확실성을 구조화하고 제품으로 풀어온 Product Owner. 스테이블코인, DeFi, 물류 자동화, MPC 지갑 등 B2B 프로젝트 포트폴리오.",
  openGraph: {
    title: "이종화 | Product Owner Portfolio",
    description: "규제를 설계 조건으로 전환하고, 기술을 이해관계자 언어로 번역하는 Product Owner.",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary",
    title: "이종화 | Product Owner Portfolio",
    description: "규제와 기술이 맞물린 시장에서 B2B 문제를 풀어온 Product Owner 포트폴리오.",
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
