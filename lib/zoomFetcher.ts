// lib/zoomFetcher.ts
import axios from 'axios';

const ZOOM_BASE_URL = `${process.env.NEXT_PUBLIC_ZOOM_URL}/zoom`;

export const zoomFetcher = (endpoint: string) => axios.get(`${ZOOM_BASE_URL}${endpoint}`).then(res => res.data);


export const socialFetcher = (endpoint: string) => axios.get(endpoint).then(res => res.data);
