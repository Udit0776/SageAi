import React from "react";
import { PuffLoader } from "react-spinners";

export default function CoverLetterLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
      <PuffLoader color="gray" size={60} />
      <p className="text-xs text-muted-foreground animate-pulse font-medium">
        Loading Cover Letter Generator...
      </p>
    </div>
  );
}
