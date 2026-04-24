export type Nullable<T> = T | null;

export interface ApiResponse<T> {
  sucess: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorBody {
  message?: string;
  error?: string;
  status?: number;
  path?: string;
  timestamp?: string;
}
