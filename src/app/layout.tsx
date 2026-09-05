import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recourse — Autonomous Pre-Transaction Risk Governance & Cryptographic Dispute Defense",
  description:
    "Institutional liability, predictive RTO hedging, and cryptographic dispute-defense engine for autonomous agentic commerce on Razorpay payment rails.",
  icons: {
    icon: "/recourse_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className="min-h-screen bg-[#F8F9FA] text-slate-900 antialiased selection:bg-slate-200 selection:text-slate-900">
        {children}
      </body>
    </html>
  );
}
