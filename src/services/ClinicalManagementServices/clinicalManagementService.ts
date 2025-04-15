import { ConsultantRoleDto } from "@/interfaces/ClinicalManagement/ConsultantRoleDto";
import { MedicationDosageDto } from "@/interfaces/ClinicalManagement/MedicationDosageDto";
import { MedicationFormDto } from "@/interfaces/ClinicalManagement/MedicationFormDto";
import { MedicationFrequencyDto } from "@/interfaces/ClinicalManagement/MedicationFrequencyDto";
import { MedicationGenericDto } from "@/interfaces/ClinicalManagement/MedicationGenericDto";
import { MedicationInstructionDto } from "@/interfaces/ClinicalManagement/MedicationInstructionDto";
import { MedicationRouteDto } from "@/interfaces/ClinicalManagement/MedicationRouteDto";
import { createEntityService } from "@/utils/Common/serviceFactory";

export const medicationRouteService = createEntityService<MedicationRouteDto>("MedicationRoute", "clinicalManagementURL");
export const medicationFormService = createEntityService<MedicationFormDto>("MedicationForm", "clinicalManagementURL");
export const medicationGenericService = createEntityService<MedicationGenericDto>("MedicationGeneric", "clinicalManagementURL");
export const consultantRoleService = createEntityService<ConsultantRoleDto>("ConsultantRole", "clinicalManagementURL");

export const medicationDosageService = createEntityService<MedicationDosageDto>("MedicationDosage", "clinicalManagementURL");
export const medicationFrequencyService = createEntityService<MedicationFrequencyDto>("MedicationFrequency", "clinicalManagementURL");
export const medicationInstructionService = createEntityService<MedicationInstructionDto>("MedicationInstruction", "clinicalManagementURL");
