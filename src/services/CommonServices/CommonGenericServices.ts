import { DepartmentDto } from "@/interfaces/Billing/DepartmentDto";
import { createEntityService } from "@/utils/Common/serviceFactory";

export const departmentListService = createEntityService<DepartmentDto>("Department", "commonURL");
