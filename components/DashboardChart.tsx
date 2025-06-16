'use client';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { useEffect, useRef } from 'react';

ChartJS.register(
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title
);

type ChartProps = {
  title: string;
  type: 'bar' | 'line' | 'pie';
  data: any;
};

export default function DashboardChart({ title, type, data }: ChartProps) {
  const chartRef = useRef(null);
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#4B5563', // Tailwind gray-600
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#6B7280' }, // Tailwind gray-500
        grid: { color: '#E5E7EB' }, // Tailwind gray-200
      },
      y: {
        ticks: { color: '#6B7280' },
        grid: { color: '#E5E7EB' },
      },
    },
  };


  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#4B5563',
        },
      },
    },
  };

  const chartComponent = {
    bar: <Bar ref={chartRef} data={data} options={commonOptions} />,
    line: <Line ref={chartRef} data={data} options={commonOptions} />,
    pie: <Pie ref={chartRef} data={data} options={pieOptions} />,
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full h-[500px] transition-all duration-300">
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      <div className="h-full">{chartComponent[type]}</div>
    </div>
  );
}
