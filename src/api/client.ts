import axios from 'axios';
import { Platform } from 'react-native';

// Default local URL depending on platform (Android emulator uses 10.0.2.2)
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export let API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_HOST;

export const setApiBaseUrl = (url: string) => {
  API_BASE_URL = url.replace(/\/$/, '');
  apiClient.defaults.baseURL = API_BASE_URL;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken: string | null = null;

export const setClientAuthToken = (token: string | null) => {
  authToken = token;
};

apiClient.interceptors.request.use(
  (config) => {
    if (authToken && config.headers) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
