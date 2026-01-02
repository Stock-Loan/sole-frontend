export interface ApiError {
	statusCode: number;
	message: string;
	detail?: string;
}

export interface ApiEnvelope<T> {
	code: string;
	message: string;
	data: T;
	details?: unknown;
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
}
