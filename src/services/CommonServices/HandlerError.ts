import { notifyError, notifyWarning } from "../../utils/Common/toastManager";
import { OperationResult, ValidationError, ConcurrencyConflictInfo } from "../../interfaces/Common/OperationResult";

export const handleError = (error: any): OperationResult<any> => {
  // Initialize result with proper structure
  const result: OperationResult<any> = {
    success: false,
    data: undefined,
    errorMessage: "",
    affectedRows: 0,
    validationErrors: [],
    concurrencyConflict: false,
  };

  try {
    if (error.response) {
      const { status, data } = error.response;
      result.errorMessage = getErrorMessageForStatus(status);

      if (data) {
        // Handle concurrency conflicts
        if (status === 409 && data.concurrencyConflict) {
          result.concurrencyConflict = true;
          result.databaseValues = data.databaseValues;
          result.currentValues = data.currentValues;

          if (data.additionalData?.conflicts) {
            const conflicts = data.additionalData.conflicts as ConcurrencyConflictInfo[];
            result.additionalData = { conflicts };
            notifyWarning("This record has been modified by another user. Please review the changes.");
            conflicts.forEach((conflict) => {
              notifyWarning(`Changed field: ${conflict.propertyName}, Current: ${conflict.currentValue}, Database: ${conflict.databaseValue}`);
            });
          }
        }
        // Handle validation errors
        else if (Array.isArray(data.errors)) {
          result.validationErrors = data.errors.map((err: any) => ({
            propertyName: err.propertyName,
            errorMessage: err.errorMessage,
          }));

          // Display validation errors
          if (result.validationErrors && result.validationErrors.length > 0) {
            result.validationErrors.forEach((validationError) => {
              notifyError(`${validationError.propertyName}: ${validationError.errorMessage}`);
            });
          }
        }
        // Handle simple message errors
        else if (data.message) {
          result.errorMessage = data.message;
          if (result.errorMessage) notifyError(result.errorMessage);
        }
      } else {
        notifyError(result.errorMessage);
      }
    }
    // Handle network errors
    else if (error.request) {
      result.errorMessage = "No response received from the server. Please check your network connection.";
      notifyError(result.errorMessage);
    }
    // Handle other errors
    else {
      result.errorMessage = `An unexpected error occurred: ${error.message}`;
      notifyError(result.errorMessage);
    }

    // Log error details for debugging
    logErrorDetails(error);
  } catch (handlingError) {
    // Handle errors that occur during error handling
    console.error("Error in error handler:", handlingError);
    result.errorMessage = "An unexpected error occurred while processing the error";
    notifyError(result.errorMessage);
  }

  return result;
};

const getErrorMessageForStatus = (status: number): string => {
  const errorMessages: Record<number, string> = {
    400: "Bad Request. Please check the data sent to the server.",
    401: "Unauthorized. Please check your credentials.",
    403: "Forbidden. You do not have permission to perform this action.",
    404: "Resource not found. The requested resource does not exist.",
    409: "Conflict. Another user has modified this record.",
    422: "Validation failed. Please check your input.",
    500: "Internal Server Error. Something went wrong on the server.",
    502: "Bad Gateway. Received an invalid response from the upstream server.",
    503: "Service Unavailable. The server is currently unable to handle the request.",
    504: "Gateway Timeout. The server took too long to respond.",
  };

  return errorMessages[status] || `Unexpected error occurred: ${status}. Please try again later.`;
};

const logErrorDetails = (error: any): void => {
  console.error("Error Details:", {
    message: error.message,
    stack: error.stack,
    response: error.response
      ? {
          status: error.response.status,
          data: error.response.data,
          concurrencyConflict: error.response.data?.concurrencyConflict,
          conflicts: error.response.data?.additionalData?.conflicts,
        }
      : null,
    request: error.request,
  });
};

export const handleConcurrencyConflict = (error: OperationResult<any>) => {
  if (error.concurrencyConflict && error.additionalData?.conflicts) {
    const conflicts = error.additionalData.conflicts as ConcurrencyConflictInfo[];
    return {
      hasConflict: true,
      currentValues: error.currentValues,
      databaseValues: error.databaseValues,
      conflicts,
      conflictDetails: conflicts.map((conflict) => ({
        field: conflict.propertyName,
        yourValue: conflict.currentValue,
        serverValue: conflict.databaseValue,
      })),
    };
  }
  return { hasConflict: false };
};
