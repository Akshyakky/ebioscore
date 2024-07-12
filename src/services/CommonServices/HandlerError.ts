import { OperationResult } from "../../interfaces/Common/OperationResult";

export const handleError = (error: any): OperationResult<any> => {
    const result: OperationResult<any> = {
      success: false,
      affectedRows: 0,
      errorMessage: error.message || "An error occurred",
      validationErrors: [],
    };
  
    if (error.response && error.response.data && error.response.data.Errors) {
      result.validationErrors = error.response.data.Errors.map((err: any) => ({
        PropertyName: err.PropertyName,
        ErrorMessage: err.ErrorMessage,
      }));
    }
  
    return result;
  };