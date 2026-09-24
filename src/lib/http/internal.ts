import axios, { AxiosError } from "axios";

// API routes live in this app, so requests are same-origin and the
// Auth.js session cookie is sent automatically. 401s are handled by callers
// (see getErrorMessage) rather than globally, since some pages probe
// signed-in-only data for anonymous visitors.
const internalApi = axios.create({ baseURL: "/api" });

export { AxiosError };
export default internalApi;
