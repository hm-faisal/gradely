const FeedbackLoading = () => {
  return (
    <section aria-busy="true" aria-label="Loading feedback">
      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="space-y-2 border-b p-6">
          <div className="h-5 w-28 animate-pulse rounded bg-muted" />
          <div className="h-3 w-64 animate-pulse rounded bg-muted" />
        </div>

        <div className="divide-y">
          {["one", "two"].map((key) => (
            <div key={key} className="space-y-3 px-6 py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-56 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="h-20 animate-pulse rounded-lg bg-muted/60" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeedbackLoading;
