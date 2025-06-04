import { toast } from 'react-hot-toast';
import axios from 'axios';
import { axiosInstance } from '@/lib/fetcher';

export interface FileData {
  file_name: string;
  url: string;
}

export interface KnowledgeBaseData {
  text?: string;
  file?: FileData[];
}

export const initializeKnowledgeBase = async (
  teamId: string,
  mutate: (data?: KnowledgeBaseData, shouldRevalidate?: boolean) => void
) => {
  const toastId = toast.loading('Initializing knowledge base...');
  try {
    const response = await axiosInstance.post<KnowledgeBaseData>('/api/knowledge-base', { team_id: teamId });
    mutate(response.data, false);
    toast.success('Knowledge base initialized successfully!', { id: toastId });
    return true;
  } catch (error) {
    console.error('Initialization error:', error);
    toast.error('Failed to initialize knowledge base', { id: toastId });
    return false;
  }
};

export const deleteFile = async (
  teamId: string,
  url: string,
  mutate: () => void
) => {
  const toastId = toast.loading('Deleting file...');
  try {
    await axiosInstance.delete('/api/knowledge-base', { data: { team_id: teamId, url } });
    toast.success('File deleted successfully!', { id: toastId });
    mutate();
  } catch (error) {
    console.error('Delete error:', error);
    toast.error('Failed to delete file.', { id: toastId });
  }
};

export const uploadAndUpdateKnowledgeBase = async (
  teamId: string,
  file: File | null,
  knowledgeBase: string,
  existingFiles: FileData[],
  mutate: () => void,
  fileInputRef: React.RefObject<HTMLInputElement | null> // Updated type
) => {
  try {
    const uploadedFiles: FileData[] = [];
    if (file) {
      const uploadToastId = toast.loading('Uploading file...');
      const formData = new FormData();
      formData.append('files', file);

      const uploadRes = await axios.post(
        'https://callingagent.thebotss.com/api/knowledge-base/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      toast.success('File uploaded successfully!', { id: uploadToastId });

      const uploaded = uploadRes.data?.files || [];
      uploaded.forEach((f: any) => {
        if (f.access_url && f.original_filename) {
          uploadedFiles.push({ file_name: f.original_filename, url: f.access_url });
        }
      });
    }

    const mergedFiles = [...existingFiles, ...uploadedFiles];
    const patchToastId = toast.loading('Updating knowledge base...');
    await axiosInstance.patch('/api/knowledge-base', {
      team_id: teamId,
      text: knowledgeBase,
      file: mergedFiles,
    });
    toast.success('Knowledge base updated successfully!', { id: patchToastId });

    mutate();
    // Safely reset the file input only if ref exists
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  } catch (error) {
    console.error('Save error:', error);
    toast.error('Failed to update knowledge base.');
  }
};