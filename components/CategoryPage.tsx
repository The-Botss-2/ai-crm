'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { fetcher } from '@/lib/fetcher';
import CategoryPanel from '@/components/CategoryPanel';
import { FiEdit3 } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
import { axiosInstance } from '@/lib/fetcher';
import { toast } from 'react-hot-toast';
import { useTeamRole } from '@/context/TeamRoleContext';

const CategoryPage = ({ teamId }: { teamId: string }) => {
  const { data: categories = [], mutate } = useSWR(`/api/category?teamId=${teamId}`, fetcher);
  const [search, setSearch] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {role , access} = useTeamRole()

  const filtered = categories.filter((cat: any) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
   const toastId = toast.loading('Deleting category...');

    try {
      await axiosInstance.delete(`/api/category/${id}`);
      toast.success('Category deleted', { id: toastId });
      mutate();
    } catch {
      toast.error('Failed to delete category', { id: toastId });
    }
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-900">Categories</h1>
     {role === 'admin' || access?.categories?.includes('write')?  <button
          onClick={() => {
            setEditingCategory(null);
            setDrawerOpen(true);
          }}
          className="bg-blue-100 text-blue-800 text-xs px-4 py-2 rounded hover:bg-blue-200"
        >
          + Add Category
        </button>:null } 
      </div>

 <div className="flex justify-between items-center mb-4 py-4 border-b border-gray-300">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="text-xs px-5 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <table className="w-full text-sm border-separate border-spacing-y-2">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((cat: any) => (
            <tr key={cat._id} className="bg-white shadow-sm hover:shadow-md rounded-md">
              <td className="px-4 py-2 font-medium text-blue-800 bg-blue-50 rounded-l-md">
                {cat.name}
              </td>
              <td className="px-4 py-2">{cat.description || '-'}</td>
              <td className="px-4 py-2 flex gap-2">
               {role === 'admin' || access?.categories?.includes('update')?   <button
                  onClick={() => {
                    setEditingCategory(cat);
                    setDrawerOpen(true);
                  }}
                  className="p-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  <FiEdit3 size={16} />
                </button>:null}
                 {role === 'admin' ||  access?.categories?.includes('delete')? 
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="p-1 rounded bg-red-100 text-red-800 hover:bg-red-200"
                >
                  <MdDeleteOutline size={16} />
                </button>:null}
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center text-gray-500 py-4">
                No categories found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <CategoryPanel
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        category={editingCategory}
        teamId={teamId}
        mutate={mutate}
      />
    </div>
  );
};

export default CategoryPage;
