"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

const LIMIT_OPTIONS = [5, 10, 20, 50, 100];

type TableControlsProps = {
  pathname: string;
  currentSearch?: string;
  currentLimit?: number;
  extraParams?: Record<string, string | undefined>;
  searchPlaceholder?: string;
};

export const TableControls = ({
  pathname,
  currentSearch = "",
  currentLimit = 10,
  extraParams = {},
  searchPlaceholder = "Search…",
}: TableControlsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const buildHref = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams();

      for (const [key, value] of searchParams.entries()) {
        if (key !== "offset" && key !== "search" && key !== "searchParam" && key !== "limit") {
          params.set(key, value);
        }
      }

      for (const [key, value] of Object.entries(extraParams)) {
        if (value !== undefined && value !== "") {
          params.set(key, value);
        }
      }

      for (const [key, value] of Object.entries(overrides)) {
        if (value !== undefined && value !== "") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      params.delete("offset");

      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams, extraParams],
  );

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const search = (formData.get("search") as string)?.trim();
      const href = buildHref({ search: search || undefined });
      startTransition(() => router.push(href));
    },
    [buildHref, router],
  );

  const handleLimit = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const limit = e.currentTarget.value;
      const href = buildHref({ limit });
      startTransition(() => router.push(href));
    },
    [buildHref, router],
  );

  return (
    <div className={`flex flex-wrap items-center gap-2 ${isPending ? "opacity-60" : ""}`}>
      <form onSubmit={handleSearch} className="flex flex-1 items-center gap-1">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="table-search-input"
            name="search"
            type="search"
            defaultValue={currentSearch}
            placeholder={searchPlaceholder}
            className="h-8 w-48 rounded-md border bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-8 items-center rounded-md border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          Search
        </button>
      </form>

      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <label htmlFor="table-limit-select" className="whitespace-nowrap">
          Per page:
        </label>
        <select
          id="table-limit-select"
          value={currentLimit}
          onChange={handleLimit}
          className="h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {LIMIT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
