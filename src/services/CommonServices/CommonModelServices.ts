import { DepartmentDto } from "../../interfaces/Billing/DepartmentDto";
import { AlertDto } from "../../interfaces/Common/AlertManager";
import { createEntityService } from "../../utils/Common/serviceFactory";

export const alertService = createEntityService<AlertDto>("Alert", "commonURL");
export const departmentService = createEntityService<DepartmentDto>("Department", "commonURL");
