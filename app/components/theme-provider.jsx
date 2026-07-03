"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

// Suppress React 19 development-only warning regarding script tags inside next-themes
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

function ThemeSync() {
  const { theme } = useTheme()
  React.useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute("data-theme", theme)
    }
  }, [theme])
  return null
}

export function ThemeProvider({ children, ...props }) {
    return (
      <NextThemesProvider {...props}>
        <ThemeSync />
        {children}
      </NextThemesProvider>
    )
}