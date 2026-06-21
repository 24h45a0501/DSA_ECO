import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'DSC ECO — Data Structures Command Ecosystem',
  description: 'Advanced interactive 3D visualization platform for mastering data structures and algorithms.',
  keywords: ['DSA', 'Data Structures', 'Algorithms', '3D Visualization', 'Cyberpunk', 'Interactive'],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-black text-gray-100">
        {children}
      </body>
    </html>
  );
}
