"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 100,
  ...props
}) {
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />;
}

function Tooltip({
  ...props
}) {
  return <TooltipPrimitive.Root {...props} />;
}

const TooltipTrigger = TooltipPrimitive.Trigger

function TooltipContent({
  className,
  sideOffset = 4,
  ...props
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-[#09090b] border border-white/10 text-white animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs shadow-md",
          className
        )}
        {...props} />
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
