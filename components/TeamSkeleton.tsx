"use client";

export default function TeamSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-4 p-6">
      {[...Array(4)].map((_, idx) => (
        <div key={idx} className="p-4  rounded-xl w-72 bg-white/50 border border-gray-200 hover:shadow-md transition flex justify-between items-center h-24"></div>
      ))}
    </div>
  );
}
