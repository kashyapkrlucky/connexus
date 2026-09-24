import axios, { AxiosError } from "axios";
import { toast } from "sonner";

// API routes live in this app, so requests are same-origin and the
// Auth.js session cookie is sent automatically.
const internalApi = axios.create({ baseURL: "/api" });

internalApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      toast.error("Please sign in to continue.", { id: "unauthorized" });
    }
    return Promise.reject(error);
  },
);

export { AxiosError };
export default internalApi;
