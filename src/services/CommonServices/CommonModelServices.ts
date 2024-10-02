import { AlertDto } from "../../interfaces/Common/AlertManager";
import { createEntityService } from "../../utils/Common/serviceFactory";

export const alertService = createEntityService<AlertDto>("Alert", "commonURL");
