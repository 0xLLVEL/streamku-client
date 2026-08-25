import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { fetchApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Streamku",
  description: "Streamku adalah platform streaming yang menyediakan film dan serial TV berkualitas tinggi.",
};

async function getUser() {
  try {
    const res = await fetchApi('/auth/me');
    if (res.ok) {
      const json = await res.json();
      return json.data?.user || json.user || null;
    }
  } catch {
    return null;
  }
  return null;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "dark", inter.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        <QueryProvider>
          <AuthProvider initialUser={user}>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
