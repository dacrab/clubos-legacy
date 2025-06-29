import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { Toaster } from 'sonner';
import { PageWrapper } from "@/components/ui/page-wrapper";
import { Footer } from "@/components/layout/Footer";
import { DashboardProvider } from "@/components/dashboard/DashboardProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Σύστημα Διαχείρισης",
  description: "Σύστημα διαχείρισης κωδικών και πωλήσεων",
};

export const viewport = {
  themeColor: "#000000",
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="el" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingProvider>
            <DashboardProvider>
              <PageWrapper variant="root">
                {children}
              </PageWrapper>
              <Footer />
              <Toaster position="top-right" />
            </DashboardProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
