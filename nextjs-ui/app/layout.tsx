import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import TopNav from "./components/TopNav";
import { Inter } from "next/font/google";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin']
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[url('/background.webp')] bg-cover bg-center bg-no-repeat`}>
        <Providers>
          <TopNav />
          {children}
          <ToastContainer 
            position="top-center"
            hideProgressBar
            closeButton={false}
          />
        </Providers>
      </body>
    </html>
  );
}
