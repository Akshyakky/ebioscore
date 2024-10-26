import { notifyError, notifyWarning } from "../../utils/Common/toastManager";
import { OperationResult, ConcurrencyConflictInfo } from "../../interfaces/Common/OperationResult";

export const handleError = (error: any): OperationResult<any> => {
  const result: OperationResult<any> = error;

  if (error.response) {
    const status = error.response.status;
    result.errorMessage = getErrorMessageForStatus(status);

    if (error.response.data) {
      // Handle concurrency conflicts
      if (status === 409 && error.response.data.concurrencyConflict) {
        result.concurrencyConflict = true;
        result.databaseValues = error.response.data.databaseValues;
        result.currentValues = error.response.data.currentValues;

        const conflicts = error.response.data.additionalData?.conflicts as ConcurrencyConflictInfo[];
        if (conflicts) {
          result.additionalData = { conflicts };
          // Show concurrency conflict notification
          notifyWarning("This record has been modified by another user. Please review the changes.");
          conflicts.forEach((conflict) => {
            notifyWarning(`Changed field: ${conflict.propertyName}, Current: ${conflict.currentValue}, Database: ${conflict.databaseValue}`);
          });
        }
      } else if (error.response.data.errors) {
        // Handle validation errors
        result.validationErrors = error.response.data.errors.map((err: any) => ({
          propertyName: err.propertyName,
          errorMessage: err.errorMessage,
        }));
        result.validationErrors?.forEach((validationError) => {
          notifyError(`${validationError.propertyName}: ${validationError.errorMessage}`);
        });
      } else if (error.response.data.message) {
        result.errorMessage = error.response.data.message;
        notifyError(result.errorMessage ?? "");
      }
    } else {
      notifyError(result.errorMessage);
    }
  } else if (error.request) {
    // Client-side error or network error
    result.errorMessage = "No response received from the server. Please check your network connection.";
    notifyError(result.errorMessage);
  } else {
    // Other errors (e.g., programming errors)
    result.errorMessage = `An unexpected error occurred: ${error.message}`;
    notifyError(result.errorMessage);
  }

  // Log the error for debugging purposes
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

  return result;
};

const getErrorMessageForStatus = (status: number): string => {
  const errorMessages: { [key: number]: string } = {
    400: "Bad Request. Please check the data sent to the server.",
    401: "Unauthorized. Please check your credentials.",
    403: "Forbidden. You do not have permission to perform this action.",
    404: "Resource not found. The requested resource does not exist.",
    409: "Conflict. Another user has modified this record.",
    500: "Internal Server Error. Something went wrong on the server.",
    502: "Bad Gateway. Received an invalid response from the upstream server.",
    503: "Service Unavailable. The server is currently unable to handle the request.",
    504: "Gateway Timeout. The server took too long to respond.",
  };

  return errorMessages[status] || `Unexpected error occurred: ${status}. Please try again later.`;
};

// Helper function to handle concurrency conflicts in components
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
