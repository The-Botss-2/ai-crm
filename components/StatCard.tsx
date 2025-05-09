
export default function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3 text-blue-500 dark:text-blue-300">
            {icon}
          </div>
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    );
  }
 