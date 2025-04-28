import { LanguageProvider } from '../app/context/languagecontext';
import { AuthProvider } from '../app/context/authContext';
import { Inter } from 'next/font/google';
import './globals.css';

// Import database initialization (will run on server)
import './db-init';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Plant Identifier',
  description: 'Identify, learn about, and care for plants',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}