export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
  tenancyMode: import.meta.env.VITE_TENANCY_MODE ?? "single",
  appName: import.meta.env.VITE_APP_NAME ?? "SOLE",
};
