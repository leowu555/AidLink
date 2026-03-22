import type { Metadata } from "next";
import { Inter, Quicksand } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "Aid-Link — Crisis Response Coordination",
  description: "Coordinate volunteers during emergencies. Triage, verify, assign.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${quicksand.variable} antialiased`}>
        <div className="relative z-0 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
