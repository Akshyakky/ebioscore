//interfaces/OperationResults
export interface ValidationError {
  propertyName: string;
  errorMessage: string;
}
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  errorMessage?: string;
  affectedRows?: number;
  validationErrors?: ValidationError[];
  auAccessID?: number;
}
