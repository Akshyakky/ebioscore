import { ConsultantRoleDto } from "../../interfaces/ClinicalManagement/ConsultantRoleDto";
import { MedicationFormDto } from "../../interfaces/ClinicalManagement/MedicationFormDto";
import { MedicationGenericDto } from "../../interfaces/ClinicalManagement/MedicationGenericDto";
import { MedicationRouteDto } from "../../interfaces/ClinicalManagement/MedicationRouteDto";
import { createEntityService } from "../../utils/Common/serviceFactory";

export const medicationRouteService = createEntityService<MedicationRouteDto>(
  "MedicationRoute",
  "clinicalManagementURL"
);
export const medicationFormService = createEntityService<MedicationFormDto>(
  "MedicationForm",
  "clinicalManagementURL"
);
export const medicationGenericService =
  createEntityService<MedicationGenericDto>(
    "MedicationGeneric",
    "clinicalManagementURL"
  );
export const consultantRoleService = createEntityService<ConsultantRoleDto>(
  "ConsultantRole",
  "clinicalManagementURL"
);
