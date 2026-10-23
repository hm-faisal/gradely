"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { cn } from "cn";
import type { ComponentProps } from "react";

function TooltipProvider(
  props: ComponentProps<typeof TooltipPrimitive.Provider>,
) {
  return <TooltipPrimitive.Provider {...props} />;
}

function Tooltip(props: ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root {...props} />;
}

function TooltipTrigger(
  props: ComponentProps<typeof TooltipPrimitive.Trigger>,
) {
  return <TooltipPrimitive.Trigger {...props} />;
}

type TooltipContentProps = ComponentProps<typeof TooltipPrimitive.Popup> & {
  align?: ComponentProps<typeof TooltipPrimitive.Positioner>["align"];
  side?: ComponentProps<typeof TooltipPrimitive.Positioner>["side"];
  sideOffset?: ComponentProps<typeof TooltipPrimitive.Positioner>["sideOffset"];
};

function TooltipContent({
  align = "center",
  className,
  side = "top",
  sideOffset = 6,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        side={side}
        sideOffset={sideOffset}
        className="z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          role="tooltip"
          className={cn(
            "z-50 max-w-xs origin-[var(--transform-origin)] rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md transition-[transform,opacity] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-instant:transition-none data-starting-style:scale-95 data-starting-style:opacity-0",
            className,
          )}
          {...props}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
