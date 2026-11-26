"use client";

export function FieldCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border-default bg-bg-surface p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-bg-subtle" />
          <div>
            <div className="h-4 w-28 rounded bg-bg-subtle" />
            <div className="mt-1.5 h-3 w-16 rounded bg-bg-subtle" />
          </div>
        </div>
        <div className="h-8 w-8 rounded-full bg-bg-subtle" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-12 rounded-lg bg-bg-subtle" />
        <div className="h-12 rounded-lg bg-bg-subtle" />
        <div className="h-12 rounded-lg bg-bg-subtle" />
        <div className="h-12 rounded-lg bg-bg-subtle" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="h-3 w-24 rounded bg-bg-subtle" />
        <div className="h-3 w-20 rounded bg-bg-subtle" />
      </div>
    </div>
  );
}

export function FieldTableSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border-default bg-bg-surface">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-border-default px-5 py-4 last:border-0">
          <div className="h-8 w-8 rounded bg-bg-subtle" />
          <div className="h-4 w-32 rounded bg-bg-subtle" />
          <div className="ml-auto h-4 w-20 rounded bg-bg-subtle" />
          <div className="h-4 w-16 rounded bg-bg-subtle" />
          <div className="h-8 w-8 rounded-full bg-bg-subtle" />
        </div>
      ))}
    </div>
  );
}
