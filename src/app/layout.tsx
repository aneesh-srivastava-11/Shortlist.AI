import type { Metadata } from 'next';
import './globals.css';

import { Bebas_Neue, JetBrains_Mono } from 'next/font/google';

const bebasNeue = Bebas_Neue({
  weight: '400',
  variable: '--font-bebas-neue',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
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
        className={`${bebasNeue.variable} ${jetbrainsMono.variable} font-mono h-full bg-background text-foreground antialiased selection:bg-primary/20`}
      >
        {children}
      </body>
    </html>
  );
}
