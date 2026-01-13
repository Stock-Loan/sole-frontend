export interface ApiError {
	code?: string;
	message?: string;
	details?: Record<string, unknown>;
}

export interface ApiEnvelope<T> {
	status: string;
	data: T;
	message?: string;
}

export interface PageResult<T> {
	items: T[];
	total: number;
}

export interface PaginatedResponse<T> {
	items: T[];
	total?: number;
	page?: number;
	page_size?: number;
}

export interface Money {
	amount: string;
	currency: string;
}
