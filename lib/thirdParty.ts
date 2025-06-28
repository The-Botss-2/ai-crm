import axios from 'axios';

export const axiosInstanceThirdParty = axios.create({
  baseURL: `${process.env.CALLING_AGENT_URL}`,
});

export const fetcher = async (url: string) => {
  const response = await axiosInstanceThirdParty.get(url);
  return response.data;
};
