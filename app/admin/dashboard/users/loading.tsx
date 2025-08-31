export default function Loading() {
  return (
    <div className="min-h-screen bg-[#141414] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="w-48 h-8 bg-[#252525] rounded-md animate-pulse"></div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="w-full md:w-64 h-10 bg-[#252525] rounded-md animate-pulse"></div>
            <div className="w-32 h-10 bg-[#252525] rounded-md animate-pulse"></div>
          </div>
        </div>

        {/* Table skeleton */}
        <div className="bg-[#1A1A1A] rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <div className="w-full">
              {/* Table header */}
              <div className="border-b border-[#252525] bg-[#1F1F1F] flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="py-4 px-6 flex-1">
                    <div className="h-5 bg-[#252525] rounded-md animate-pulse"></div>
                  </div>
                ))}
              </div>

              {/* Table rows */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                <div key={row} className="border-b border-[#252525] flex">
                  {[1, 2, 3, 4, 5].map((cell) => (
                    <div key={cell} className="py-4 px-6 flex-1">
                      <div
                        className="h-5 bg-[#252525] rounded-md animate-pulse"
                        style={{ width: `${Math.floor(Math.random() * 50) + 50}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Pagination skeleton */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#252525]">
            <div className="w-32 h-5 bg-[#252525] rounded-md animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#252525] rounded-md animate-pulse"></div>
              <div className="w-24 h-5 bg-[#252525] rounded-md animate-pulse"></div>
              <div className="w-8 h-8 bg-[#252525] rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
