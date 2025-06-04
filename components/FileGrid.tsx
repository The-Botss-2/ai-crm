'use client';

import Image from 'next/image';
import React from 'react';
import { AiTwotoneFileText, AiTwotoneCloseCircle } from 'react-icons/ai';

interface FileItem {
  file_name: string;
  url: string;
}

interface FileGridProps {
  files: FileItem[];
  onDeleteFile: (url: string) => void;
  data: any
}

export function FileGrid({ files, onDeleteFile, data }: FileGridProps) {
  if (!files.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      <div>
        {files.length === 0 ? (
          <p className="text-center text-gray-400 text-lg italic">No files found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {files.map((file) => {
              const isImage = /\.(png|jpe?g|gif|bmp|webp|svg)$/i.test(file.url);
              const isCsv = /\.csv$/i.test(file.url);

              const fileUrl = file.url

              const isDoc = /\.(doc|docx)$/i.test(fileUrl);

              // Icon URLs
              const csvIcon = 'https://cdn-icons-png.flaticon.com/512/888/888879.png';
              const docIcon = 'https://cdn-icons-png.flaticon.com/512/281/281760.png';
              const genericIcon = 'https://cdn-icons-png.flaticon.com/512/337/337946.png';

              // Choose image or fallback icon
              const previewImage = isImage
                ? fileUrl
                : isCsv
                  ? csvIcon
                  : isDoc
                    ? docIcon
                    : genericIcon;

              return (
                <div
                  key={file.file_name}
                  className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center text-center transition-transform transform hover:scale-[1.04] hover:shadow-lg"
                >
                  <Image
                    width={100}
                    height={100}
                    src={isImage ? fileUrl : previewImage}
                    alt={file.file_name}
                    className="w-36 h-36 object-contain rounded-lg mb-4 border shadow-sm bg-gray-50"
                    loading="lazy"
                  />

                  <h3
                    className="text-lg font-semibold text-blue-900 truncate w-full mb-1"
                    title={file.file_name}
                  >
                    {file.file_name}
                  </h3>


                  <p className="text-xs text-blue-700 mb-3">

                    {new Date(data.createdAt).toLocaleDateString()}
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
                      onClick={() => onDeleteFile(file.url)}
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
}

interface FileCardProps {
  fileName: string;
  onDelete: () => void;
}

