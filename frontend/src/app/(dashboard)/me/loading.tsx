const SummaryLoading = () => {
  return (
    <section
      aria-busy="true"
      aria-label="Loading summary"
      className="flex flex-col gap-4"
    >
      <div className="space-y-2">
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
        <div className="h-3 w-64 animate-pulse rounded bg-muted" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {["total", "approved", "pending", "feedback"].map((key) => (
          <div
            key={key}
            className="flex items-start justify-between gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10"
          >
            <div className="w-full space-y-2.5">
              <div className="h-2.5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-7 w-12 animate-pulse rounded bg-muted" />
              <div className="h-2.5 w-32 animate-pulse rounded bg-muted" />
            </div>
            <div className="size-9 shrink-0 animate-pulse rounded-lg bg-muted" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-80 rounded-xl bg-card ring-1 ring-foreground/10 lg:col-span-2">
          <div className="space-y-3 p-6">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="h-3 w-64 animate-pulse rounded bg-muted" />
            <div className="mt-8 h-48 animate-pulse rounded-lg bg-muted/60" />
          </div>
        </div>
        <div className="h-80 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
          <div className="space-y-3">
            <div className="h-4 w-36 animate-pulse rounded bg-muted" />
            <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            <div className="mx-auto mt-8 size-28 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SummaryLoading;
