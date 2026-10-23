const SubmissionsLoading = () => {
  return (
    <section aria-busy="true" aria-label="Loading submissions">
      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="flex items-start justify-between gap-4 border-b p-6">
          <div className="space-y-2">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-3 w-56 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
        </div>

        <div className="divide-y">
          {["one", "two", "three", "four"].map((key) => (
            <div key={key} className="flex items-center gap-6 px-4 py-4">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-44 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full max-w-md animate-pulse rounded bg-muted" />
              </div>
              <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
              <div className="hidden h-3 w-24 animate-pulse rounded bg-muted md:block" />
              <div className="hidden h-3 w-20 animate-pulse rounded bg-muted lg:block" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubmissionsLoading;
