'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { useEffect, useState } from 'react';
import TaskPanel from '@/components/TaskPanel';
import classNames from 'classnames';
import { fetcher } from '@/lib/fetcher';
import { useTeamRole } from '@/context/TeamRoleContext';

const STATUS_TABS = ['all', 'pending', 'in_progress', 'completed', 'blocked'];

export default function TaskPageClient({userID}:any) {
 
  const { id: teamId } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role,access, loading } = useTeamRole();

  const { data: tasks = [], mutate } = useSWR(`/api/tasks?teamId=${teamId}`, fetcher);

  const initialTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('tab', activeTab);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [activeTab]);

  const filteredTasks =
    (activeTab === 'all' ? tasks : tasks.filter((t: any) => t.status === activeTab)).filter((t: any) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
      {role === 'admin' || access?.tasks?.includes('write') ?   <button
          className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-xs hover:bg-blue-200 transition"
          onClick={() => {
            setEditingTask(null);
            setDrawerOpen(true);
          }}
        >
          + Add Task
        </button>: null}
      </div>

      {/* Tabs + Search */}
      <div className="flex justify-between items-center mb-4 p-4 border-b border-gray-300">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tasks..."
          className="text-xs px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        <div className="flex gap-2 text-xs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={classNames(
                'px-3 py-1 rounded-full text-xs',
                activeTab === tab
                  ? 'bg-blue-100 text-blue-800 font-semibold'
                  : 'bg-gray-100 text-gray-800'
              )}
            >
              {tab === 'in_progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="min-w-full text-sm border-separate border-spacing-y-2">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-2 text-gray-700">Title</th>
              <th className="px-4 py-2 text-gray-700">Status</th>
              <th className="px-4 py-2 text-gray-700">Priority</th>
              <th className="px-4 py-2 text-gray-700">Due Date</th>
              <th className="px-4 py-2 text-gray-700">Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task: any) => (
              <tr
                key={task._id}
                onClick={
                  role !== 'readonly'
                    ? () => {
                        setEditingTask(task);
                        setDrawerOpen(true);
                      }
                    : undefined
                }
                className={classNames(
                  'bg-white shadow-sm transition duration-150 rounded-md',
                  {
                    'hover:shadow-md cursor-pointer': role !== 'readonly',
                    'cursor-not-allowed': role === 'readonly',
                  }
                )}
              >
                <td className="px-4 py-2 rounded-l-md bg-blue-50 font-medium text-blue-700">{task.title}</td>

                <td className={classNames(
                  'px-4 py-2',
                  'rounded-md',
                  {
                    'bg-yellow-100 text-yellow-800': task.status === 'pending',
                    'bg-blue-100 text-blue-800': task.status === 'in_progress',
                    'bg-green-100 text-green-800': task.status === 'completed',
                    'bg-red-100 text-red-800': task.status === 'blocked',
                  }
                )}>
                  <span className="px-2 py-1 rounded-full text-xs font-medium capitalize">
                    {task.status.replace('_', ' ')}
                  </span>
                </td>

                <td className={classNames(
                  'px-4 py-2 rounded-md',
                  {
                    'bg-gray-100 text-gray-800': task.priority === 'low',
                    'bg-blue-100 text-blue-800': task.priority === 'medium',
                    'bg-orange-100 text-orange-800': task.priority === 'high',
                    'bg-red-100 text-red-800': task.priority === 'urgent',
                  }
                )}>
                  <span className="px-2 py-1 rounded-full text-xs font-medium capitalize">
                    {task.priority}
                  </span>
                </td>

                <td className="px-4 py-2 text-gray-700">{task.dueDate ? task.dueDate.slice(0, 10) : '-'}</td>

                <td className="px-4 py-2 text-gray-700">{task.assignedTo?.name || task.assignedTo?.email || '-'}</td>
              </tr>
            ))}
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center px-4 py-6 text-gray-500">
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TaskPanel userID={userID} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} task={editingTask} teamId={teamId} mutate={mutate} role={role} access={access} />
    </div>
  );
}
