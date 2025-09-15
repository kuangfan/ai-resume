import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "AI生成简历",
  description: "使用AI创建属于你的简历",
  keywords: [
    "AI",
    "简历",
    "生成",
    "简历生成",
    "简历生成器",
    "简历生成工具",
    "简历生成器",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
