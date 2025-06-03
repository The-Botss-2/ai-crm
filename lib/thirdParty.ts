import axios from 'axios';

export const axiosInstanceThirdParty = axios.create({
  baseURL: "https://callingagent.thebotss.com",
});

export const fetcher = async (url: string) => {
  const response = await axiosInstanceThirdParty.get(url);
  return response.data;
};
