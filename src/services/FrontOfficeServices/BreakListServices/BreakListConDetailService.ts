import axios from "axios";
import { APIConfig } from "../../../apiConfig";
import { BreakConDetailData } from "../../../interfaces/FrontOffice/BreakConDetailsData";
import { OperationResult } from "../../../interfaces/Common/OperationResult";

// Handle errors
const handleError = <T>(error: any): OperationResult<T> => {
  return {
    success: false,
    data: {} as T,
    errorMessage: error.message || "An error occurred",
  };
};

// Service to save break condition details
const saveBreakConDetail = async (
  token: string,
  breakConDetailData: BreakConDetailData
): Promise<OperationResult<BreakConDetailData>> => {
  debugger;
  try {
    const url = `${APIConfig.frontOffice}BreakConDetail/SaveBreakConDetail`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post<OperationResult<BreakConDetailData>>(
      url,
      breakConDetailData,
      { headers }
    );

    if (response.data && response.data.success !== undefined) {
      if (!response.data.success) {
        throw new Error(
          response.data.errorMessage || "Failed to save break condition detail."
        );
      }
      return response.data;
    } else {
      throw new Error("Invalid response format received.");
    }
  } catch (error: any) {
    return handleError<BreakConDetailData>(error);
  }
};

// Service to get all break condition details

const getAllBreakConDetails = async (
  token: string
): Promise<OperationResult<any[]>> => {
  try {
    const url = `${APIConfig.frontOffice}BreakConDetail/GetAllBreakConDetails`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await axios.get<OperationResult<any[]>>(url, { headers });
    debugger;
    if (!response.data.success) {
      throw new Error(
        response.data.errorMessage || "Failed to fetch break lists."
      );
    }

    return response.data;
  } catch (error: any) {
    return handleError(error);
  }
};

// Service to update physician or resource name

// New service to update the active status of a break condition detail
const updateBreakConDetailActiveStatus = async (
  token: string,
  bCDID: number,
  isActive: boolean
): Promise<OperationResult<any>> => {
  try {
    // Construct the URL for the API request
    const url = `${APIConfig.frontOffice}BreakConDetail/UpdateBreakConDetailActiveStatus/${bCDID}`;

    // Define the headers for the request
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Send a PUT request with boolean value in the request body
    const response = await axios.put<OperationResult<any>>(url, isActive, {
      headers,
    });

    // Check if the response indicates success
    if (response.data.success) {
      console.log(
        "Break condition detail active status updated successfully:",
        response.data.data
      );
    } else {
      console.error(
        "Failed to update break condition detail active status:",
        response.data.errorMessage
      );
    }

    return response.data;
  } catch (error) {
    console.error(
      "Error updating break condition detail active status:",
      error
    );
    // Handle the error appropriately
    return handleError<any>(error); // Ensure handleError is properly defined in your project
  }
};

const getBreakConDetailById = async (
  token: string,
  bLID: number
): Promise<OperationResult<BreakConDetailData[]>> => {
  debugger;
  try {
    // Construct the URL for the API endpoint
    const url = `${APIConfig.frontOffice}BreakConDetail/GetBreakConDetailById/${bLID}`;

    // Set up the headers for the API call
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // Make the API call using axios
    const response = await axios.get<OperationResult<BreakConDetailData[]>>(
      url,
      { headers }
    );

    // Check if the response indicates success
    if (!response.data.success) {
      throw new Error(
        response.data.errorMessage ||
          "Failed to fetch break connection details."
      );
    }

    // Return the data from the response
    return response.data;
  } catch (error) {
    // Handle any errors that occur during the API call
    return handleError<BreakConDetailData[]>(error);
  }
};

// New service to get break condition detail by ID
// const getBreakConDetailById = async (
//   token: string,
//   blID: number
// ): Promise<OperationResult<BreakConDetailData>> => {
//   debugger
//   try {
//     const url = `${APIConfig.frontOffice}BreakConDetail/GetBreakConDetailById/${blID}`;
//     const headers = {
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     };

//     const response = await axios.get<OperationResult<BreakConDetailData>>(url, { headers });

//     if (response.data && response.data.success !== undefined) {
//       if (!response.data.success) {
//         throw new Error(response.data.errorMessage || 'Failed to fetch break condition detail.');
//       }
//       return response.data;
//     } else {
//       throw new Error('Invalid response format received.');
//     }
//   } catch (error: any) {
//     return handleError<BreakConDetailData>(error);
//   }
// };

export const BreakListConDetailsService = {
  saveBreakConDetail,
  getAllBreakConDetails,
  updateBreakConDetailActiveStatus,
  getBreakConDetailById,
};
