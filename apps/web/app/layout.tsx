import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Insurance FNOL intake & extraction",
  description: "Build scoped by the AI Use-Case Studio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
