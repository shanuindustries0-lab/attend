export default function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-12 bg-gray-50 border-b border-gray-100 flex items-center px-4">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="h-16 border-b border-gray-50 flex items-center px-4 gap-6"
          >
            <div className="h-10 bg-gray-100 rounded w-48"></div>
            <div className="flex-1 flex gap-4">
              {[...Array(7)].map((_, j) => (
                <div key={j} className="h-10 bg-gray-50 rounded flex-1"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
