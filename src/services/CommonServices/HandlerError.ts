import { notifyError } from "./../../utils/Common/toastManager";
import { OperationResult } from "../../interfaces/Common/OperationResult";

export const handleError = (error: any): OperationResult<any> => {
  const result: OperationResult<any> = error;

  if (error.response) {
    const status = error.response.status;

    result.errorMessage = getErrorMessageForStatus(status);

    if (error.response.data) {
      if (error.response.data.errors) {
        result.validationErrors = error.response.data.errors.map(
          (err: any) => ({
            propertyName: err.propertyName,
            errorMessage: err.errorMessage,
          })
        );

        result.validationErrors!.forEach((validationError) => {
          notifyError(
            `${validationError.propertyName}: ${validationError.errorMessage}`
          );
        });
      } else if (error.response.data.message) {
        result.errorMessage = error.response.data.message;
        notifyError(result.errorMessage!);
      }
    }
  } else if (error.request) {
    // Client-side error or network error
    result.errorMessage =
      "No response received from the server. Please check your network connection.";
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
    409: "Conflict. The request could not be completed due to a conflict with the current state of the resource.",
    500: "Internal Server Error. Something went wrong on the server.",
    502: "Bad Gateway. Received an invalid response from the upstream server.",
    503: "Service Unavailable. The server is currently unable to handle the request.",
    504: "Gateway Timeout. The server took too long to respond.",
  };

  return (
    errorMessages[status] ||
    `Unexpected error occurred: ${status}. Please try again later.`
  );
};
