import axios from "axios";
import { unwrapApiResponse } from "@/shared/api/response";
import type { ServiceStatus, StatusSummary } from "./types";

type RawStatusCheck = {
	status?: string;
	version?: string;
	message?: string;
};

type RawStatusSummary = {
	status?: string;
	ready?: boolean;
	environment?: string;
	version?: string;
	timestamp?: string;
	checks?: Record<string, RawStatusCheck | undefined>;
};

export async function getStatusSummary() {
	const baseURL = import.meta.env.VITE_API_BASE_URL;
	const { data } = await axios.get<RawStatusSummary>(`${baseURL}/status/summary`);
	const payload = unwrapApiResponse<RawStatusSummary>(data);
	return normalizeStatusSummary(payload);
}

function normalizeStatusSummary(raw: RawStatusSummary): StatusSummary {
	const checks = raw.checks ?? {};
	const normalizedChecks: StatusSummary["checks"] = {};

	for (const [name, check] of Object.entries(checks)) {
		if (!check) {
			normalizedChecks[name] = undefined;
			continue;
		}
		normalizedChecks[name] = {
			status: normalizeServiceStatus(check.status),
			version: check.version,
			message: check.message,
		};
	}

	return {
		status: normalizeServiceStatus(raw.status),
		ready: Boolean(raw.ready),
		environment: raw.environment,
		version: raw.version ?? normalizedChecks.api?.version,
		timestamp: raw.timestamp ?? new Date().toISOString(),
		checks: normalizedChecks,
	};
}

function normalizeServiceStatus(value?: string): ServiceStatus {
	return value === "ok" || value === "degraded" ? value : "down";
}
