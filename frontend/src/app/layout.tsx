import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { Providers } from "@/provider";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gradely — Sign in or create an account",
  description:
    "Gradely brings assignments, submissions, and feedback into one calm workspace.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", quicksand.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
