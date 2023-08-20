import axios from 'axios';
import { BASE_DEV_SERVER_URL } from '../const';
import router from 'next/router';

export const instance = axios.create({
  baseURL: BASE_DEV_SERVER_URL,
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      router.push(`/dashboard/error`);
    }
  }
);