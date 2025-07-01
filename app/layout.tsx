import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PropertyPro - Property Investment Platform',
  description: 'Professional property investment platform for finding and analyzing distressed properties',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}