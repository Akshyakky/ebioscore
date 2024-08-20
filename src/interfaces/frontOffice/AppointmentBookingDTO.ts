export interface AppointmentBookingDTO {
  abID: number;
  abFName: string;
  abLName?: string;
  abMName?: string;
  providerName: string;
  abDurDesc: string;
  abDate: string; // Date as a string from the server
  abTime: string; // Time as a string from the server
  abStatus: string;
  abEndTime: string; // Date as a string from the server
  abTitle?: string;
  cancelReason?: string;
  // Add other properties if needed
}
