const TENANT_KEY = "sole:tenant";

function getStoredTenant() {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(TENANT_KEY);
}

export const tenantStore = {
  getTenantId: () => getStoredTenant(),
  setTenantId: (tenantId: string) => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(TENANT_KEY, tenantId);
  },
  clear: () => {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(TENANT_KEY);
  },
};
