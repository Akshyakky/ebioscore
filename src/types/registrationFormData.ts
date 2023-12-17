export interface RegsitrationFormData {
    UHID: string;
    regDate: string;
    pic: { value: string; label: string };
    mobileNo: string;
    title: { value: string; label: string };
    firstName: string;
    lastName: string;
    idNo: string;
    gender: { value: string; label: string };
    ageOrDob: string;
    ageUnit: string;
    age: number;
    dob: string;
    passportID: string;
    nationality: { value: string; label: string };
    address:string;
    country: { value: string; label: string };
    city: { value: string; label: string };
    area: { value: string; label: string };
    postCode:string;
    email:string;
    company: { value: string; label: string };
    smsYN:string;
    emailYN:string;
    visitType:string;
    department: { value: string; label: string };
    attendingPhy: { value: string; label: string };
    primaryIntroducingSource: { value: string; label: string };
    membershipScheme:{ value: string; label: string };
    membershipExpiryDate:string;
    nextOfKin: [
      {
        NokRegisterYN: string,
        NoKName: string,
        NokRelationShipID: number,
        NokRelationShip: string,
        NokDOB: string,
      },
    ],
    insuranceDetails: [{ InsuranceID: number, InsuranceName: string }],
  };