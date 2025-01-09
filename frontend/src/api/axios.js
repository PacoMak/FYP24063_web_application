import axios from "axios";

const server_domain = "http://127.0.0.1";
const server_port = "5000";
const api = axios.create({
  baseURL: `${server_domain}:${server_port}`,
});

export default api;
