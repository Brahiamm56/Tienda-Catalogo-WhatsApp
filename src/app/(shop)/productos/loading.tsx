export default function ProductsLoading() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        {/* Search bar skeleton */}
        <div className="skeleton mx-auto h-12 w-full max-w-md rounded-full" />

        {/* Category filter chips */}
        <div className="flex items-center gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="skeleton h-8 shrink-0 rounded-full"
              style={{ width: `${64 + i * 12}px` }}
            />
          ))}
        </div>

        {/* Product grid — 2 cols mobile, 4 cols desktop, 8 cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton aspect-[3/4] w-full rounded-2xl" />
              <div className="space-y-1.5 px-1">
                <div className="skeleton h-3 w-16" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-5 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
