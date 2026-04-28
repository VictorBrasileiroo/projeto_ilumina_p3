export type Nullable<T> = T | null;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[] | null;
}

export interface ApiErrorBody {
  message?: string;
  error?: string;
  status?: number;
  path?: string;
  timestamp?: string;
}
