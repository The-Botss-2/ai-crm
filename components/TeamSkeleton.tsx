"use client";

export default function TeamSkeleton() {
  return (
    <div className="p-6">
      <div className="w-full border border-gray-200 rounded-md overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
          Loading Team Data...
        </div>
        <div className="divide-y divide-gray-200">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="flex items-center px-4 py-4 space-x-4 animate-pulse">
              <div className="w-6 h-6 rounded-full bg-gray-200" />
              <div className="w-1/4 h-4 bg-gray-200 rounded" />
              <div className="w-1/4 h-4 bg-gray-200 rounded" />
              <div className="w-1/6 h-4 bg-gray-200 rounded" />
              <div className="w-1/5 h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
