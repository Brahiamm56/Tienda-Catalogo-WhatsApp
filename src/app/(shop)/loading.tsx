export default function HomeLoading() {
  return (
    <>
      {/* Hero showcase skeleton — matches PerfumeShowcase area */}
      <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden sm:min-h-[85vh]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 text-center">
          {/* Brand badge */}
          <div className="skeleton mx-auto h-5 w-32" />
          {/* Title lines */}
          <div className="skeleton mx-auto h-12 w-72 sm:h-16 sm:w-96" />
          <div className="skeleton mx-auto h-12 w-56 sm:h-16 sm:w-80" />
          {/* CTA button */}
          <div className="skeleton mx-auto mt-4 h-12 w-44 rounded-full" />
        </div>
      </div>

      {/* Gold divider placeholder */}
      <div className="skeleton mx-auto h-px w-full max-w-3xl" />

      {/* Products section */}
      <div className="space-y-10 pt-8 sm:space-y-14">
        {/* Carousel section skeleton */}
        {[0, 1].map((section) => (
          <section
            key={section}
            className="mx-auto w-full max-w-7xl space-y-5 px-4 sm:px-6 lg:px-10"
          >
            {/* Section badge + title */}
            <div className="space-y-2">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-8 w-52" />
            </div>

            {/* Product card row */}
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
        ))}
      </div>
    </>
  );
}
