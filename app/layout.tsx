import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { fetchApi } from "@/lib/api";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Streamku - Premium Streaming",
  description: "Your ultimate entertainment platform.",
};

async function getUser() {
  try {
    const res = await fetchApi('/auth/me');
    if (res.ok) {
      const json = await res.json();
      return json.data?.user || json.user || null;
    }
  } catch (err) {
    return null;
  }
  return null;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        <AuthProvider initialUser={user}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
