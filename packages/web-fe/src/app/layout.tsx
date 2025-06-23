import './globals.css';
import type { Metadata } from 'next';
import { SWRProvider } from '@/components/SWRProvider';

export const metadata: Metadata = {
  title: 'Student Directory - Performance Demo',
  description:
    'A demo application for teaching performance optimization in three-tier architecture',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SWRProvider>{children}</SWRProvider>
      </body>
    </html>
  );
}
