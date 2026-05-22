import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ATS Resume Checker & Optimizer | Recruiter-Grade AI scoring',
  description:
    'Optimize your resume for Applicant Tracking Systems (ATS). Scan keywords, rewrite bullets with quantifiable metrics, detect formatting errors, and run simulated recruiter reviews to land more interviews.',
  keywords: [
    'ATS Resume Checker',
    'Resume Optimizer',
    'AI Resume Builder',
    'Resume Keyword Scanner',
    'Recruiter Feedback Simulation',
  ],
  authors: [{ name: 'Antigravity AI' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans h-full bg-background text-foreground antialiased selection:bg-primary/20`}
      >
        {children}
      </body>
    </html>
  );
}
