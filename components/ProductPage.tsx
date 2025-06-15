'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { axiosInstance, fetcher } from '@/lib/fetcher';
import ProductPanel from '@/components/ProductPanel';
import { FiEdit3 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { MdDeleteOutline } from 'react-icons/md';

const ProductPage = ({ teamId }: any) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: products = [], mutate } = useSWR(`/api/product?team-id=${teamId}`, fetcher);
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-900">Products</h1>
        <button
          className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-xs hover:bg-blue-200 transition"
          onClick={() => {
            setEditingProduct(null);
            setDrawerOpen(true);
          }}
        >
          + Add Product
        </button>
      </div>

      <div className="flex justify-between items-center mb-4 py-4 border-b border-gray-300">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          className="text-xs px-5 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="overflow-auto">
        <table className="min-w-full text-sm border-separate border-spacing-y-2">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-2 text-gray-700">Name</th>
              <th className="px-4 py-2 text-gray-700">Price</th>
              <th className="px-4 py-2 text-gray-700">Quantity</th>
              <th className="px-4 py-2 text-gray-700">Category</th>
              <th className="px-4 py-2 text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products
              .filter((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((product: any) => (
                <tr
                  key={product._id}
                  className="bg-white shadow-sm hover:shadow-md transition rounded-md"
                >
                  <td className="px-4 py-2 font-medium text-blue-700 bg-blue-50 rounded-l-md">
                    {product.name}
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {product.currency || '$'} {product.price}
                  </td>
                  <td className="px-4 py-2 text-gray-700">{product.quantity || '-'}</td>
                  <td className="px-4 py-2 text-gray-700">
                    {product.categoryId?.name || 'Uncategorized'}
                  </td>
                  <td className="px-4 py-2 text-gray-700 flex gap-2 items-center">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setDrawerOpen(true);
                      }}
                      className="bg-blue-100 text-blue-800 p-1 rounded hover:bg-blue-200 transition"
                    >
                      <FiEdit3 size={16} />
                    </button>
                    <button
                      onClick={async () => {
                        const toastId = toast.loading('Deleting product...');
                        try {
                          await axiosInstance.delete(`/api/product/${product._id}`);
                          toast.success('Product deleted', { id: toastId });
                          mutate();
                        } catch {
                          toast.error('Failed to delete product', { id: toastId });
                        }
                      }}
                      className="bg-red-100 text-red-800 p-1 rounded hover:bg-red-200 transition"
                    >
                      <MdDeleteOutline size={16} />
                    </button>
                  </td>
                </tr>

              ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center px-4 py-6 text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ProductPanel
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        product={editingProduct}
        teamId={teamId}
        mutate={mutate}
      />
    </div>
  );
};

export default ProductPage;
