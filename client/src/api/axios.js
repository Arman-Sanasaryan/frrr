import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000"
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = token;
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response.status === 401) {
      const refresh = localStorage.getItem("refresh");

      const res = await axios.post("http://localhost:3000/refresh", {
        refreshToken: refresh
      });

      localStorage.setItem("token", res.data.token);
      err.config.headers.Authorization = res.data.token;

      return axios(err.config);
    }
    throw err;
  }
);

export default api;