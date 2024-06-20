//interfaces/OperationResultts
export interface OperationResult<T> {
  length: number;
  success: boolean;
  data?: T;
  errorMessage?: string;
  affectedRows?: number;
  validationErrors?: Record<string, string[]>;
}
