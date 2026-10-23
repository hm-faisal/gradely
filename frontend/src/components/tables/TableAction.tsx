"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type TableActionButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children"
> & {
  children: ReactNode;
  label: string;
};

function TableActionButton({
  children,
  className,
  label,
  size = "icon-sm",
  variant = "outline",
  ...props
}: TableActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant={variant}
            size={size}
            className={className}
            aria-label={label}
            {...props}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

type TableActionLinkProps = {
  children: ReactNode;
  className?: string;
  href: string;
  label: string;
  size?: ComponentProps<typeof Button>["size"];
  variant?: ComponentProps<typeof Button>["variant"];
};

function TableActionLink({
  children,
  className,
  href,
  label,
  size = "icon-sm",
  variant = "outline",
}: TableActionLinkProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={href}
            aria-label={label}
            className={cn(buttonVariants({ variant, size }), className)}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export { TableActionButton, TableActionLink };
