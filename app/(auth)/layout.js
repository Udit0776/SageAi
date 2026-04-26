"use client";

import React, { useEffect } from "react";

export default function AuthLayout({ children }) {
  useEffect(() => {
    // Force scroll to top when the auth page loads
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
      {children}
    </div>
  );
}
