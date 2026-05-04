export interface ApiResponse<T> {
  status: number;
  body: T;
}
