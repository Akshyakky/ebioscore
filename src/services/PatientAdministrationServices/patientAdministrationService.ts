import { DischargeStatusDto } from "../../interfaces/PatientAdministration/DischargeStatusDto";
import { createEntityService } from "../../utils/Common/serviceFactory";

export const dischargeStatusService = createEntityService<DischargeStatusDto>("DischargeStatus", "patientAdministrationURL");
