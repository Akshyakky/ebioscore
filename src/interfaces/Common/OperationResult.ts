export interface OperationResult<T> {
  success: boolean;
  data?: T;
  errorMessage?: string;
}
