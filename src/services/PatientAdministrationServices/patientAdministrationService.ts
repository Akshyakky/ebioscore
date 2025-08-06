import { DischargeStatusDto } from "@/interfaces/PatientAdministration/DischargeStatusDto";
import { IpDischargeDetailDto } from "@/interfaces/PatientAdministration/IpDischargeDetailDto";
import { createEntityService } from "@/utils/Common/serviceFactory";

export const dischargeStatusService = createEntityService<DischargeStatusDto>("DischargeStatus", "patientAdministrationURL");
export const dischargeSummaryService = createEntityService<IpDischargeDetailDto>("IpDischargeDetail", "patientAdministrationURL");
