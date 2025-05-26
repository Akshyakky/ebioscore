import { DischargeStatusDto } from "@/interfaces/PatientAdministration/DischargeStatusDto";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { IpDischargeDetailsDto } from "@/interfaces/PatientAdministration/IpDischargeDetailDto";
import { useMemo } from "react";

export const dischargeStatusService = useMemo(() => createEntityService<DischargeStatusDto>("DischargeStatus", "patientAdministrationURL"), []);
export const dischargeSummaryService = useMemo(() => createEntityService<IpDischargeDetailsDto>("DischargeSummary", "patientAdministrationURL"), []);
