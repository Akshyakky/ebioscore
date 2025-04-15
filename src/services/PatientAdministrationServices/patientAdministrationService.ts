import { DischargeStatusDto } from "@/interfaces/PatientAdministration/DischargeStatusDto";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { IpDischargeDetailsDto } from "@/interfaces/PatientAdministration/IpDischargeDetailDto";

export const dischargeStatusService = createEntityService<DischargeStatusDto>("DischargeStatus", "patientAdministrationURL");
export const dischargeSummaryService = createEntityService<IpDischargeDetailsDto>("DischargeSummary", "patientAdministrationURL");
