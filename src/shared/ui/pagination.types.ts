export interface PaginationProps {
	page: number;
	pageSize: number;
	total?: number;
	hasNext?: boolean;
	isLoading?: boolean;
	onPageChange: (page: number) => void;
}
