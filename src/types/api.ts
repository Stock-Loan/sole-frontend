export interface ApiError {
	statusCode: number;
	message: string;
	detail?: string;
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
}
