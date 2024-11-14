import axios from "axios";
import { APIConfig } from "../../apiConfig";

/**
 * Fetch client parameters from the server.
 * @param {string} clientCode - The code of the client to fetch parameters for.
 * @returns {Promise<any>} - The fetched client parameters.
 * @throws {Error} - Throws an error if the request fails.
 */
const getClientParameter = async (clientCode: string): Promise<any> => {
  try {
    const response = await axios.get(`${APIConfig.moduleURL}GetClientParameter`, {
      params: { ClientCode: clientCode },
    });
    // Optionally add response validation here
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle Axios errors specifically
      // Provide detailed logging or custom error messages as needed
      throw new Error("Error fetching client parameters: " + error.message);
    } else {
      // Handle non-Axios errors
      throw error;
    }
  }
};

export const ClientParameterService = {
  getClientParameter,
};
