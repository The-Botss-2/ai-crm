'use client';

import { axiosInstanceThirdParty } from '@/lib/thirdParty';
import Image from 'next/image';
import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';

interface FileData {
  filename: string;
  original_filename: string;
  access_url: string;
  content_type: string;
  upload_date: string;
  description?: string | null;
  size: number;
}

const KnowledgeBase = ({ user_id }: { user_id: string }) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await axiosInstanceThirdParty.get('/api/knowledge-base/files');
      setFiles(res.data.files || []);
    } catch {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('files', selectedFile);
      if (description.trim()) formData.append('description', description.trim());

      const res = await axiosInstanceThirdParty.post('/api/knowledge-base/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(res.data.message || 'File uploaded successfully');
      setSelectedFile(null);
      setDescription('');
      if (inputFileRef.current) inputFileRef.current.value = '';
      fetchFiles();
    } catch {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    try {
      await axiosInstanceThirdParty.delete(`/api/knowledge-base/files/${filename}`);
      toast.success('File deleted');
      fetchFiles();
    } catch {
      toast.error('Failed to delete file');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
   

      {/* Upload Section */}
      <div className="mb-12 bg-white rounded-2xl shadow-md p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 tracking-wide">Upload New File</h2>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <input
            ref={inputFileRef}
            type="file"
            onChange={handleFileChange}
            className="border border-blue-300 rounded-lg px-4 py-2 text-base w-full md:w-auto cursor-pointer text-blue-700 focus:ring-2 focus:ring-blue-400 focus:border-blue-600 transition shadow-sm hover:shadow-md"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-base flex-grow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-600 transition shadow-sm hover:shadow-md"
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-2 rounded-lg font-semibold shadow hover:from-purple-600 hover:to-blue-500 transition disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      {/* Files List */}
      <div>
        {loading ? (
          <p className="text-center text-gray-500 text-lg animate-pulse">Loading files...</p>
        ) : files.length === 0 ? (
          <p className="text-center text-gray-400 text-lg italic">No files found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {files.map((file) => {
              const isImage = file.content_type.startsWith('image/');
              const fileUrl = `${process.env.CALLING_AGENT_URL}${file.access_url}`;

              return (
                <div
                  key={file.filename}
                  className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center text-center transition-transform transform hover:scale-[1.04] hover:shadow-lg"
                >
                  {isImage ? (
                    <Image
                    width={100}
                    height={100}
                      src={fileUrl}
                      alt={file.original_filename}
                      className="w-36 h-36 object-contain rounded-lg mb-4 border border-blue-300 shadow-sm"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center rounded-lg bg-blue-100 mb-4 border border-blue-300 text-blue-700 text-sm font-semibold px-3 py-2">
                      {file.original_filename}
                    </div>
                  )}

                  <h3
                    className="text-lg font-semibold text-blue-900 truncate w-full mb-1"
                    title={file.original_filename}
                  >
                    {file.original_filename}
                  </h3>

                  {file.description && (
                    <p className="text-sm text-gray-600 italic mb-3 px-2">
                      {file.description}
                    </p>
                  )}

                  <p className="text-xs text-blue-700 mb-3">
                    {(file.size / 1024).toFixed(2)} KB |{' '}
                    {new Date(file.upload_date).toLocaleDateString()}
                  </p>

                  <div className="flex gap-8 justify-center">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-700 hover:underline font-semibold text-sm"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDelete(file.filename)}
                      className="text-red-600 hover:underline font-semibold text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
