export type HealthStatus = "ok" | "degraded" | "error" | "unknown";

export type HealthCheck = {
  status: HealthStatus;
  environment: string;
  timestamp: string;
  checks: Record<
    string,
    {
      status: HealthStatus | string;
      error?: string;
    }
  >;
};

export interface SummaryCardProps {
  label: string;
  value: string;
  tone?: string;
}

export interface ServiceCardProps {
  name: string;
  status: string;
  error?: string;
}
