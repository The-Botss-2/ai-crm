import axios from 'axios';

// Create an axios instance with the base URL
const callingagent = axios.create({
  baseURL: 'https://callingagent.thebotss.com/api/', // Replace this with your actual base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default callingagent;
