import axios from "axios";
import { unwrapApiResponse } from "@/shared/api/response";
import type { StatusSummary } from "./types";

export async function getStatusSummary() {
	const baseURL = import.meta.env.VITE_API_BASE_URL;
	const { data } = await axios.get<StatusSummary>(`${baseURL}/status/summary`);
	return unwrapApiResponse<StatusSummary>(data);
}
