import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

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
      <body className="font-body antialiased noise-overlay">
        <Sidebar />
        <div className="ml-72 min-h-screen">
          <Header />
          <main className="p-6 hex-grid">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
