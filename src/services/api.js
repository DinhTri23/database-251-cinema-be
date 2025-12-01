import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:6868", // URL gốc backend local
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
