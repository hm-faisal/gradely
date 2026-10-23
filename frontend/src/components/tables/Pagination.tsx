import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/types/pagination";
import { getPageRange, getPaginationItems } from "@/utils/pagination";

type PaginationProps = {
  meta: PaginationMeta;
  buildHref: (page: number) => string;
  /** Plural noun used in the result summary, e.g. "submissions". */
  itemLabel?: string;
  className?: string;
};

export const Pagination = ({
  meta,
  buildHref,
  itemLabel = "results",
  className,
}: PaginationProps) => {
  if (meta.total === 0) return null;

  const totalPages = Math.max(meta.totalPages, 1);
  const currentPage = Math.min(Math.max(meta.page, 1), totalPages);
  const { from, to } = getPageRange(currentPage, meta.limit, meta.total);
  const items = getPaginationItems(currentPage, totalPages);

  return (
    <nav
      aria-label={`Pagination for ${itemLabel}`}
      className={cn(
        "flex flex-col gap-3 rounded-xl bg-card px-4 py-3 text-sm shadow-xs ring-1 ring-foreground/10 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}</span>–
        <span className="font-medium text-foreground">{to}</span> of{" "}
        <span className="font-medium text-foreground">{meta.total}</span>{" "}
        {itemLabel}
      </p>

      <div className="flex items-center gap-1">
        <PageLink
          href={buildHref(currentPage - 1)}
          disabled={currentPage <= 1}
          label="Previous page"
          className="px-2"
        >
          <ChevronLeft className="size-3.5" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Previous</span>
        </PageLink>

        <ul className="flex items-center gap-1">
          {items.map((item, index) =>
            item === "ellipsis" ? (
              <li
                key={`ellipsis-after-${items[index - 1] ?? 1}`}
                aria-hidden="true"
                className="flex size-8 items-center justify-center text-xs text-muted-foreground"
              >
                …
              </li>
            ) : (
              <li key={item}>
                <Link
                  href={buildHref(item)}
                  aria-label={`Page ${item}`}
                  aria-current={item === currentPage ? "page" : undefined}
                  className={cn(
                    buttonVariants({
                      variant: item === currentPage ? "default" : "outline",
                      size: "icon-sm",
                    }),
                    "tabular-nums",
                  )}
                >
                  {item}
                </Link>
              </li>
            ),
          )}
        </ul>

        <PageLink
          href={buildHref(currentPage + 1)}
          disabled={currentPage >= totalPages}
          label="Next page"
          className="px-2"
        >
          <span className="sr-only sm:not-sr-only">Next</span>
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </PageLink>
      </div>
    </nav>
  );
};

type PageLinkProps = {
  href: string;
  disabled: boolean;
  label: string;
  className?: string;
  children: ReactNode;
};

const PageLink = ({
  href,
  disabled,
  label,
  className,
  children,
}: PageLinkProps) => {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "pointer-events-none opacity-50",
          className,
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        className,
      )}
    >
      {children}
    </Link>
  );
};
