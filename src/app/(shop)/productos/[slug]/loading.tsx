export default function ProductDetailLoading() {
  return (
    <main className="pb-28 sm:pb-12">
      {/* Breadcrumb skeleton */}
      <nav className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-10">
        <div className="flex items-center gap-2">
          <div className="skeleton h-3.5 w-3.5 rounded" />
          <div className="skeleton h-3 w-3 rounded" />
          <div className="skeleton h-3 w-16" />
          <div className="skeleton h-3 w-3 rounded" />
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-3 w-3 rounded" />
          <div className="skeleton h-3 w-32" />
        </div>
      </nav>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-4 sm:px-6 sm:pt-6 lg:gap-10 lg:px-10">
        <section className="grid gap-6 rounded-[2rem] bg-white/[0.02] p-4 sm:rounded-[2.5rem] sm:p-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10 lg:p-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          {/* Left column — Image gallery skeleton */}
          <div className="space-y-3">
            <div className="skeleton aspect-square w-full rounded-2xl" />
            {/* Thumbnail row */}
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton size-16 shrink-0 rounded-xl sm:size-20"
                />
              ))}
            </div>
          </div>

          {/* Right column — Product info skeleton */}
          <div className="flex flex-col lg:pt-4">
            {/* Badges */}
            <div className="flex items-center gap-2">
              <div className="skeleton h-6 w-20 rounded-full" />
              <div className="skeleton h-6 w-16 rounded-full" />
            </div>

            {/* Title */}
            <div className="mt-5 space-y-2">
              <div className="skeleton h-9 w-full sm:h-12" />
              <div className="skeleton h-9 w-3/5 sm:h-12" />
            </div>

            {/* Description lines */}
            <div className="mt-4 space-y-2">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-4/5" />
            </div>

            {/* Price */}
            <div className="mt-6">
              <div className="skeleton h-10 w-32 sm:h-12" />
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="skeleton h-12 flex-1 rounded-full" />
              <div className="skeleton h-12 flex-1 rounded-full" />
            </div>

            {/* Features list */}
            <div className="mt-7 grid gap-3 border-t border-white/[0.06] pt-6 sm:grid-cols-2">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="skeleton size-9 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-4 w-28" />
                    <div className="skeleton h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Related products skeleton */}
      <div className="mt-12 sm:mt-16">
        <section className="mx-auto w-full max-w-7xl space-y-5 px-4 sm:px-6 lg:px-10">
          <div className="space-y-2">
            <div className="skeleton h-3 w-28" />
            <div className="skeleton h-8 w-56" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
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
        </section>
      </div>
    </main>
  );
}
