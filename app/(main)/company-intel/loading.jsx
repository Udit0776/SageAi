import React from "react";
import { BarLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="flex flex-col items-center gap-4 max-w-md w-full">
        <h2 className="text-2xl font-bold gradient-title animate-pulse">
          Researching Company Intelligence...
        </h2>
        <BarLoader width="100%" color="var(--primary)" />
        <p className="text-muted-foreground text-sm">
          Gathering insider insights and interview strategies
        </p>
      </div>
    </div>
  );
}
