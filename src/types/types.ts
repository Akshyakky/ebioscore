export interface ModuleDto {
    AuGrpID: number;
    Title: string;
    Link: string;
    ICon: string;
    // Add other properties as needed
}

export interface SubModuleDto {
    AuGrpID: number;
    Title: string;
    Link: string;
    ICon: string;
    // Add other properties as needed
}

// Define a type for user details
export type UserDetails = {
    userName: string;
    userID: number;
    adminYN:string;
    // Add other fields as necessary
  };
  