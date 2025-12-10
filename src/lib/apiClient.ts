import axios from "axios";

import { appConfig } from "./config";
import { authStore } from "@/features/auth/hooks/useAuth";
import { tenantStore } from "@/lib/tenant";

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
});

apiClient.interceptors.request.use((config) => {
  const token = authStore.getToken();
  const tenantId = tenantStore.getTenantId();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  if (tenantId) {
    config.headers = {
      ...config.headers,
      "X-Tenant-ID": tenantId,
    };
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStore.clear();
    }
    return Promise.reject(error);
  }
);
