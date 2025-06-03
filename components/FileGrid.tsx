'use client';

import React from 'react';
import { AiTwotoneFileText, AiTwotoneCloseCircle } from 'react-icons/ai';

interface FileItem {
  file_name: string;
  url: string;
}

interface FileGridProps {
  files: FileItem[];
  onDeleteFile: (url: string) => void;
}

export function FileGrid({ files, onDeleteFile }: FileGridProps) {
  if (!files.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {files.map((file) => (
        <FileCard
          key={file.url}
          fileName={file.file_name}
          onDelete={() => onDeleteFile(file.url)}
        />
      ))}
    </div>
  );
}

interface FileCardProps {
  fileName: string;
  onDelete: () => void;
}

function FileCard({ fileName, onDelete }: FileCardProps) {
  return (
    <div className="flex items-center justify-between relative bg-gray-50 border rounded-2xl py-2">
      <div className="flex flex-col items-center gap-2 mx-auto">
        <AiTwotoneFileText size={20} className="text-gray-500" />
        <span className="text-sm text-gray-700 text-center">{fileName}</span>
      </div>
      <button
        onClick={onDelete}
        className="text-red-500 hover:text-red-700 text-xs absolute top-2 right-2"
        aria-label={`Delete ${fileName}`}
      >
        <AiTwotoneCloseCircle size={16} />
      </button>
    </div>
  );
}