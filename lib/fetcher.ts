import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL  || 'http://localhost:3000',
});

export const fetcher = async (url: string) => {
  const response = await axiosInstance.get(url);
  return response.data;
};
