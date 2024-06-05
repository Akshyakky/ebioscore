//interfaces/OperationResultts
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  errorMessage?: string;
  affectedRows?: number;
  validationErrors?: Record<string, string[]>;
}
