// lib/zoomFetcher.ts
import axios from 'axios';

const ZOOM_BASE_URL = 'https://zoom.thebotss.com/zoom';

export const zoomFetcher = (endpoint: string) =>
  axios.get(`${ZOOM_BASE_URL}${endpoint}`).then(res => res.data);
