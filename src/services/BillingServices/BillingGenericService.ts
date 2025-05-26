import { ServiceTypeDto } from "@/interfaces/Billing/BChargeDetails";
import { BPatTypeDto } from "@/interfaces/Billing/BPatTypeDto";
import { BPayTypeDto } from "@/interfaces/Billing/BPayTypeDto";
import { BServiceGrpDto } from "@/interfaces/Billing/BServiceGrpDto";
import { createEntityService } from "@/utils/Common/serviceFactory";

export const patientInvioceService = createEntityService<BPatTypeDto>("PatientInvoiceCode", "billingURL");
export const serviceGroupService = createEntityService<BServiceGrpDto>("ServiceGroup", "billingURL");
export const paymentTypeService = createEntityService<BPayTypeDto>("PaymentTypes", "billingURL");
export const serviceTypeService = createEntityService<ServiceTypeDto>("ServiceType", "billingURL");
