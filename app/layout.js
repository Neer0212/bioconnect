import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BioConnect — India's Biotech Academic Platform",
  description: "Connect with biotech students, educators, and researchers. Access learning resources, research papers, and events in one platform.",
  keywords: "biotech, biotechnology, students, India, research papers, learning, education, bioconnect",
  verification: {
    google: "Y3o-21u1yXCA2Z1Le9k_aVWaaTebhOt_XrCIYww4-vo",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
