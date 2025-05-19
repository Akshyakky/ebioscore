import { z } from "zod";

// Define base schemas for reusable components
const baseEntitySchema = z.object({
  rActiveYN: z.string().default("Y"),
  rNotes: z.string().optional(),
  compID: z.number(),
  compCode: z.string(),
  compName: z.string(),
  transferYN: z.string().default("N"),
});

// Patient Registers Schema
export const patientRegistersSchema = z
  .object({
    pChartID: z.number(),
    pChartCode: z.string().min(1, "UHID is required"),
    pRegDate: z.date().or(z.string()),
    pTitleVal: z.string().min(1, "Title is required"),
    pTitle: z.string(),
    pFName: z.string().min(1, "First Name is required"),
    pMName: z.string().optional(),
    pLName: z.string().min(1, "Last Name is required"),
    pDobOrAgeVal: z.string(),
    pDobOrAge: z.string(),
    pDob: z.date().or(z.string()),
    pGender: z.string(),
    pGenderVal: z.string(),
    pBldGrp: z.string().optional(),
    pFhName: z.string().optional(),
    pTypeID: z.number().min(1, "Payment Source is required"),
    pTypeCode: z.string(),
    pTypeName: z.string(),
    fatherBldGrp: z.string().optional(),
    patMemID: z.number(),
    patMemName: z.string().optional(),
    patMemDescription: z.string().optional(),
    patMemSchemeExpiryDate: z.date().or(z.string()).optional(),
    patSchemeExpiryDateYN: z.string().default("N"),
    patSchemeDescriptionYN: z.string().default("N"),
    cancelReason: z.string().optional(),
    cancelYN: z.string().default("N"),
    attendingPhysicianId: z.number(),
    attendingPhysicianName: z.string().optional(),
    deptID: z.number(),
    deptName: z.string().optional(),
    facultyID: z.number().optional(),
    faculty: z.string().optional(),
    langType: z.string().optional(),
    pChartCompID: z.number(),
    pExpiryDate: z.date().or(z.string()).optional(),
    physicianRoom: z.string().optional(),
    regTypeVal: z.string(),
    regType: z.string().optional(),
    primaryReferralSourceId: z.number(),
    primaryReferralSourceName: z.string().optional(),
    pPob: z.string().optional(),
    patCompName: z.string().optional(),
    patCompNameVal: z.string().optional(),
    patDataFormYN: z.string().default("N"),
    intIdPsprt: z.string().optional(),
    transferYN: z.string().default("N"),
    indentityType: z.string().optional(),
    indentityValue: z.string().min(1, "Identity Number is required"),
    patientType: z.string().optional(),
  })
  .merge(baseEntitySchema);

// Patient Address Schema
export const patientAddressSchema = z.object({
  pAddID: z.number(),
  pChartID: z.number(),
  pChartCode: z.string(),
  pAddType: z.string().default("LOCAL"),
  pAddMailVal: z.string().default("N"),
  pAddMail: z.string().optional(),
  pAddSMSVal: z.string().default("N"),
  pAddSMS: z.string().optional(),
  pAddEmail: z.string().email("Invalid email format").optional(),
  pAddStreet: z.string().optional(),
  pAddStreet1: z.string().optional(),
  pAddCityVal: z.string().optional(),
  pAddCity: z.string().optional(),
  pAddState: z.string().optional(),
  pAddPostcode: z.string().optional(),
  pAddCountry: z.string().optional(),
  pAddCountryVal: z.string().optional(),
  pAddPhone1: z.string().min(1, "Mobile No is required"),
  pAddPhone2: z.string().optional(),
  pAddPhone3: z.string().optional(),
  pAddWorkPhone: z.string().optional(),
  pAddActualCountryVal: z.string().optional(),
  pAddActualCountry: z.string().optional(),
  patAreaVal: z.string().optional(),
  patArea: z.string().optional(),
  patDoorNo: z.string().optional(),
});

// Patient Overview Schema
export const patientOverviewSchema = z.object({
  patOverID: z.number(),
  pChartID: z.number(),
  pChartCode: z.string(),
  pPhoto: z.string().optional(),
  pMaritalStatus: z.string().optional(),
  pReligion: z.string().optional(),
  pEducation: z.string().optional(),
  pOccupation: z.string().optional(),
  pEmployer: z.string().optional(),
  ethnicity: z.string().optional(),
  pCountryOfOrigin: z.string().optional(),
  pAgeNumber: z.number().optional(),
  pAgeDescriptionVal: z.string().default("Years"),
});

// OP Visits Schema
export const opVisitsSchema = z
  .object({
    visitTypeVal: z.string(),
    visitType: z.string(),
  })
  .refine(
    (data) => {
      // Custom refinement to be added based on visit type validations
      return true;
    },
    {
      message: "Invalid visit configuration",
      path: ["visitTypeVal"],
    }
  );

// Next of Kin Schema
export const patNokDetailsSchema = z
  .object({
    ID: z.number().optional(),
    pNokID: z.number(),
    pChartID: z.number(),
    pNokPChartID: z.number(),
    pNokPChartCode: z.string().optional(),
    pNokRegStatusVal: z.string(),
    pNokRegStatus: z.string(),
    pNokPssnID: z.string().optional(),
    pNokDob: z.date().or(z.string()).optional(),
    pNokRelNameVal: z.string().min(1, "Relationship is required"),
    pNokRelName: z.string(),
    pNokTitleVal: z.string().min(1, "Title is required"),
    pNokTitle: z.string(),
    pNokFName: z.string().min(1, "First Name is required"),
    pNokMName: z.string().optional(),
    pNokLName: z.string().min(1, "Last Name is required"),
    pNokActualCountryVal: z.string().optional(),
    pNokActualCountry: z.string().optional(),
    pNokAreaVal: z.string().optional(),
    pNokArea: z.string().optional(),
    pNokCityVal: z.string().optional(),
    pNokCity: z.string().optional(),
    pNokCountryVal: z.string().optional(),
    pNokCountry: z.string().optional(),
    pNokDoorNo: z.string().optional(),
    pAddPhone1: z.string().min(1, "Mobile No is required"),
    pAddPhone2: z.string().optional(),
    pAddPhone3: z.string().optional(),
    pNokPostcode: z.string().optional(),
    pNokState: z.string().optional(),
    pNokStreet: z.string().optional(),
  })
  .merge(baseEntitySchema);

// Insurance Schema
export const insuranceSchema = z
  .object({
    ID: z.number().optional(),
    oPIPInsID: z.number(),
    pChartID: z.number(),
    insurID: z.number(),
    insurCode: z.string().optional(),
    insurName: z.string(),
    policyNumber: z.string().min(1, "Policy Number is required"),
    policyHolder: z.string().optional(),
    groupNumber: z.string().optional(),
    policyStartDt: z.date().or(z.string()),
    policyEndDt: z.date().or(z.string()),
    guarantor: z.string().optional(),
    relationVal: z.string().optional(),
    relation: z.string().optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
    phone1: z.string().optional(),
    phone2: z.string().optional(),
    insurStatusCode: z.string().optional(),
    insurStatusName: z.string().optional(),
    pChartCode: z.string().optional(),
    pChartCompID: z.number().optional(),
    referenceNo: z.string().optional(),
    coveredVal: z.string().optional(),
    coveredFor: z.string().optional(),
  })
  .merge(baseEntitySchema);

// Complete Patient Registration Schema
export const patientRegistrationSchema = z
  .object({
    patRegisters: patientRegistersSchema,
    patAddress: patientAddressSchema,
    patOverview: patientOverviewSchema,
    opvisits: opVisitsSchema,
  })
  .refine(
    (data) => {
      // Additional validation based on visitTypeVal
      if (data.opvisits.visitTypeVal === "H" && data.patRegisters.deptID === 0) {
        return false;
      }
      if (data.opvisits.visitTypeVal === "P" && data.patRegisters.attendingPhysicianId === 0) {
        return false;
      }
      return true;
    },
    {
      message: "Department or Physician is required based on visit type",
      path: ["opvisits.visitTypeVal"],
    }
  );

// Types generated from Zod schemas
export type PatientRegisters = z.infer<typeof patientRegistersSchema>;
export type PatientAddress = z.infer<typeof patientAddressSchema>;
export type PatientOverview = z.infer<typeof patientOverviewSchema>;
export type OPVisits = z.infer<typeof opVisitsSchema>;
export type PatientRegistrationDto = z.infer<typeof patientRegistrationSchema>;
export type PatNokDetailsDto = z.infer<typeof patNokDetailsSchema>;
export type OPIPInsurancesDto = z.infer<typeof insuranceSchema>;
