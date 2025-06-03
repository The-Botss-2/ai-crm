export default function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-500">
          {icon}
        </div>
        <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
