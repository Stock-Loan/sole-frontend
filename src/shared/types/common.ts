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

export interface PageResult<T> {
	items: T[];
	total?: number;
	page?: number;
	page_size?: number;
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
}

export interface Money {
	amount: number;
	currency: string;
}
