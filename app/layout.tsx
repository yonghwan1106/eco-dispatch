import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eco-Dispatch | 신재생 에너지 연계형 지능형 열차 스케줄링",
  description: "AI 기반 열차 스케줄 최적화로 신재생 에너지 활용 극대화 및 탄소 중립 실현",
  keywords: ["열차 스케줄링", "신재생 에너지", "AI", "강화학습", "탄소 중립", "Green Window"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Sidebar />
        <div className="ml-64 min-h-screen">
          <Header />
          <main className="p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
