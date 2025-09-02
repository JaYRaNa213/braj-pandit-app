import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// export const baseURL = 'http://192.168.1.16:5050/api';
// export const socketURL = 'ws://192.168.1.16:9000';
export const baseURL = 'https://api.vedaz.io/api';
export const socketURL = 'wss://api.vedaz.io';

const axiosInstance = axios.create({
  baseURL: baseURL,
});

const getDeviceInfo = () => {
  let osName = Platform.OS === 'android' ? 'Android' : 'iOS';
  return `${osName} ${Platform.constants.Release} | ${Platform.constants.Model}`;
};

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Set other default headers
axiosInstance.defaults.headers['Content-Type'] = 'application/json';
axiosInstance.defaults.headers['User-Agent'] = getDeviceInfo();
axiosInstance.defaults.headers['x-client-type'] = 'app';
axiosInstance.defaults.withCredentials = true;

export default axiosInstance;
