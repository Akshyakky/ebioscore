export interface ApiError {
  errors: { [key: string]: string[] }; // Adjust this according to your actual error response structure
  message?: string;
}
