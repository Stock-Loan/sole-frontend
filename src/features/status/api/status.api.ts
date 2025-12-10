import { apiClient } from "@/lib/apiClient";
import { HealthCheck } from "../types";

export const statusKeys = {
  all: ["status"] as const,
};

export async function fetchHealth(): Promise<HealthCheck> {
  const { data } = await apiClient.get<HealthCheck>("/health");
  return data;
}
