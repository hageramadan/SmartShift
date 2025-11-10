export interface ApiResponse<T> {
  message: string;
  total?: number;
  totalFiltered?: number;
  page?: number;
  limit?: number;
  data: T;
}
