import axios from 'axios';

const devUrl = 'http://localhost:5500/api';
// const devUrl = 'https://eldercarebackend.onrender.com/api';

const apiRequest = axios.create({
  baseURL: devUrl,
  withCredentials: true,
});

export default apiRequest;
