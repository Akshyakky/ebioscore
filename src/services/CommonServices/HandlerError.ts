import { notifyError } from "./../../utils/Common/toastManager";
import { OperationResult } from "../../interfaces/Common/OperationResult";

export const handleError = (error: any): OperationResult<any> => {
  const result: OperationResult<any> = error;

  if (error.response) {
    const status = error.response.status;

    switch (status) {
      case 400:
        result.errorMessage =
          "Bad Request. Please check the data sent to the server.";
        break;
      case 401:
        result.errorMessage = "Unauthorized. Please check your credentials.";
        break;
      case 403:
        result.errorMessage =
          "Forbidden. You do not have permission to perform this action.";
        break;
      case 404:
        result.errorMessage =
          "Resource not found. The requested resource does not exist.";
        break;
      case 409:
        result.errorMessage =
          "Conflict. The request could not be completed due to a conflict with the current state of the resource.";
        break;
      case 500:
        result.errorMessage =
          "Internal Server Error. Something went wrong on the server.";
        break;
      case 502:
        result.errorMessage =
          "Bad Gateway. Received an invalid response from the upstream server.";
        break;
      case 503:
        result.errorMessage =
          "Service Unavailable. The server is currently unable to handle the request.";
        break;
      case 504:
        result.errorMessage =
          "Gateway Timeout. The server took too long to respond.";
        break;
      default:
        result.errorMessage = `Unexpected error occurred: ${status}. Please try again later.`;
    }

    if (error.response.data) {
      if (error.response.data.errors) {
        result.validationErrors = error.response.data.errors.map(
          (err: any) => ({
            propertyName: err.propertyName,
            errorMessage: err.errorMessage,
          })
        );

        // Display validation errors using toast
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
