// import { ClerkProvider,
//   SignInButton,
//   SignUpButton,
//   SignedIn,
//   SignedOut,
//   UserButton, } from "@clerk/nextjs";
  import { Toaster } from "~/components/ui/sonner"

import { Inter } from "next/font/google";
// import "./globals.css";
import "~/styles/globals.css";




import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spendy - Credit Card Statement Analysis",
  description: "Upload and analyze your credit card statements",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <ClerkProvider>
      <html lang="en" className={`${geist.variable} ${inter.className}`}>
        <body className="dark">
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster position="bottom-center" richColors />
        </body>
      </html>
    // </ClerkProvider>
  );
}
