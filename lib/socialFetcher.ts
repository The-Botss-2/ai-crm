import axios from 'axios';

export const socialFetcher = (endpoint: string) => axios.get(endpoint).then(res => res.data);
