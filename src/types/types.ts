export interface ModuleDto {
    auGrpID: number;
    title: string;
    link: string;
    iCon: string;
    // Add other properties as needed
}

export interface SubModuleDto {
    auGrpID: number;
    title: string;
    link: string;
    iCon: string;
    // Add other properties as needed
}

// Define a type for user details
export type UserDetails = {
    userName: string;
    userID: number;
    adminYN:string;
    // Add other fields as necessary
  };
  