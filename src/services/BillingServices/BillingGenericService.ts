import { ServiceTypeDto } from "@/interfaces/Billing/BChargeDetails";
import { BPatTypeDto } from "@/interfaces/Billing/BPatTypeDto";
import { BPayTypeDto } from "@/interfaces/Billing/BPayTypeDto";
import { BServiceGrpDto } from "@/interfaces/Billing/BServiceGrpDto";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { useMemo } from "react";

export const patientInvioceService = useMemo(() => createEntityService<BPatTypeDto>("PatientInvoiceCode", "billingURL"), []);
export const serviceGroupService = useMemo(() => createEntityService<BServiceGrpDto>("ServiceGroup", "billingURL"), []);
export const paymentTypeService = useMemo(() => createEntityService<BPayTypeDto>("PaymentTypes", "billingURL"), []);
export const serviceTypeService = useMemo(() => createEntityService<ServiceTypeDto>("ServiceType", "billingURL"), []);
