import axios from "axios";
import { getApiBaseUrl } from "./config";

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    if (!err.response || err.config?._retry) {
      throw err;
    }

    if (err.response.status === 401) {
      const refresh = localStorage.getItem("refresh");
      if (!refresh) {
        throw err;
      }

      const res = await axios.post(`${API_BASE_URL}/refresh`, {
        refreshToken: refresh
      });

      localStorage.setItem("token", res.data.token);
      err.config._retry = true;
      err.config.headers.Authorization = `Bearer ${res.data.token}`;

      return api(err.config);
    }
    throw err;
  }
);

export default api;
