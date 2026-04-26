import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";

// const inter = ComicSansMS({ subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SageAi - Guide Your Life",
  description: "Your AI-powered personal assistant",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} min-h-full flex flex-col`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="min-h-screen">{children}</main>
            {/* Footer */}
            <footer className="bg-muted/50 py-4">
              <div className="container mx-auto px-4 text-center text-gray-200">
                <p className="text-sm">
                  Sage AI © {new Date().getFullYear()} Made with ❤️ by Udit
                  Sengar
                </p>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
