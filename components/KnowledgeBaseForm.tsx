'use client';

import React from 'react';

interface KnowledgeBaseFormProps {
  knowledgeBase: string;
  onKnowledgeBaseChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onSave: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function KnowledgeBaseForm({
  knowledgeBase,
  onKnowledgeBaseChange,
  onFileChange,
  onSave,
  fileInputRef,
}: KnowledgeBaseFormProps) {
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onFileChange(selectedFile);
  };

  return (
    <div className="space-y-6">
      <FileUploadSection
        fileInputRef={fileInputRef}
        onFileChange={handleFileInputChange}
      />
      <SystemPromptSection
        value={knowledgeBase}
        onChange={onKnowledgeBaseChange}
      />
      <SaveButton onSave={onSave} />
    </div>
  );
}

interface FileUploadSectionProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FileUploadSection({ fileInputRef, onFileChange }: FileUploadSectionProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-3">
        File
      </label>
      <input
        ref={fileInputRef}
        type="file"
        onChange={onFileChange}
        className="block w-full text-xs text-gray-700 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-blue-100 file:text-blue-800 hover:file:font-semibold"
      />
    </div>
  );
}

interface SystemPromptSectionProps {
  value: string;
  onChange: (value: string) => void;
}

function SystemPromptSection({ value, onChange }: SystemPromptSectionProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-3">
        Text
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className="w-full border rounded-md p-2 text-sm"
        placeholder="Enter knowledge base here..."
      />
    </div>
  );
}

interface SaveButtonProps {
  onSave: () => void;
}

function SaveButton({ onSave }: SaveButtonProps) {
  return (
    <div className="flex justify-end">
      <button
        onClick={onSave}
        className="bg-blue-100 text-blue-800 px-4 py-2 rounded hover:font-semibold text-xs"
      >
        Save
      </button>
    </div>
  );
}