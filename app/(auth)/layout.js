"use client";

import React, { useEffect } from "react";

export default function AuthLayout({ children }) {
  useEffect(() => {
    // Force scroll to top immediately and in the next frame
    window.scrollTo(0, 0);
    const timeout = setTimeout(() => window.scrollTo(0, 0), 0);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
      {children}
    </div>
  );
}
