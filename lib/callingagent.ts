import axios from 'axios';

// Create an axios instance with the base URL
const callingagent = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_CALLING_AGENT_URL}/api/`, // Replace this with your actual base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default callingagent;
