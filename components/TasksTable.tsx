import React from 'react';
import { MdDeleteOutline, MdOutlineRemoveRedEye } from 'react-icons/md';
import { FiEdit3 } from 'react-icons/fi';
import { useTeamRole } from '@/context/TeamRoleContext';
import classNames from 'classnames';

interface Task {
  _id: string;
  title: string;
  assignedTo?: { name?: string; email?: string };
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  createdAt: string;
}

interface TasksTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onPreview: (task: Task) => void;
  error?: boolean;
}

const TasksTable: React.FC<TasksTableProps> = ({ tasks, onEdit, onDelete, onPreview, error }) => {
  const { role, loading } = useTeamRole();

  if (loading) return <p>Loading...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-separate border-spacing-y-2">
        <thead>
          <tr className="text-gray-700 bg-gray-100">
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-left">Assigned To</th>
            <th className="px-4 py-2 text-left">Priority</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Due Date</th>
            <th className="px-4 py-2 text-left">Created</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <tr
                key={task._id}
                className="bg-white shadow-sm hover:shadow-md transition duration-150 rounded-md"
              >
                <td className="px-4 py-2 rounded-l-md bg-blue-50 font-medium text-blue-700">{task.title}</td>
                <td className="px-4 py-2 text-gray-800">{task.assignedTo?.name || task.assignedTo?.email || '-'}</td>
                <td className="px-4 py-2">
                  <span
                    className={classNames(
                      'px-2 py-1 rounded-full text-xs font-semibold capitalize',
                      {
                        'bg-gray-100 text-gray-800': task.priority === 'low',
                        'bg-blue-100 text-blue-800': task.priority === 'medium',
                        'bg-orange-100 text-orange-800': task.priority === 'high',
                        'bg-red-100 text-red-800': task.priority === 'urgent',
                      }
                    )}
                  >
                    {task.priority}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span
                    className={classNames(
                      'px-2 py-1 rounded-full text-xs font-semibold capitalize',
                      {
                        'bg-yellow-100 text-yellow-800': task.status === 'pending',
                        'bg-blue-100 text-blue-800': task.status === 'in_progress',
                        'bg-green-100 text-green-800': task.status === 'completed',
                        'bg-red-100 text-red-800': task.status === 'blocked',
                      }
                    )}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-800">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-2 text-gray-600">{new Date(task.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 rounded-r-md space-x-2">
                  {role !== 'readonly' && (
                    <button
                      onClick={() => onEdit(task)}
                      className="bg-blue-100 text-blue-800 p-1 rounded hover:underline"
                    >
                      <FiEdit3 size={16} />
                    </button>
                  )}
                  {role !== 'readonly' && (
                    <button
                      onClick={() => onDelete(task)}
                      className="bg-red-100 text-red-800 p-1 rounded hover:underline"
                    >
                      <MdDeleteOutline size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => onPreview(task)}
                    className="bg-green-100 text-green-800 p-1 rounded hover:underline"
                  >
                    <MdOutlineRemoveRedEye size={16} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-500">
                {error ? 'Failed to load tasks' : 'No tasks found'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TasksTable;
