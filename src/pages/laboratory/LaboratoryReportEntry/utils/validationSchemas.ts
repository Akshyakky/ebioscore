import { ComponentResultDto, LabResultItemDto } from "@/interfaces/Laboratory/LaboratoryReportEntry";
import { LCENT_ID } from "@/types/lCentConstants";
import * as z from "zod";

export const createBulkUpdateSchema = () =>
  z
    .object({
      bulkStatus: z.string().optional(),
      bulkReason: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.bulkStatus === "R" && !data.bulkReason?.trim()) {
          return false;
        }
        return true;
      },
      {
        message: "Rejection reason is required when status is Rejected",
        path: ["bulkReason"],
      }
    );

export const createInvestigationUpdateSchema = () =>
  z
    .object({
      investigationId: z.number(),
      investigationName: z.string(),
      investigationCode: z.string(),
      currentStatus: z.string(),
      status: z.string(),
      reason: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.status === "R" && !data.reason?.trim()) {
          return false;
        }
        return true;
      },
      {
        message: "Rejection reason is required",
        path: ["reason"],
      }
    );

export const createDynamicComponentSchema = (investigations: LabResultItemDto[]) => {
  const shape: Record<string, any> = {};

  investigations.forEach((investigation) => {
    const invPrefix = `inv_${investigation.investigationId}`;

    // Add approval fields
    shape[`${invPrefix}_technicianId`] = z.number().optional();
    shape[`${invPrefix}_technicianName`] = z.string().optional();
    shape[`${invPrefix}_technicianApproval`] = z.enum(["Y", "N"]).default("N");
    shape[`${invPrefix}_consultantId`] = z.number().optional();
    shape[`${invPrefix}_consultantName`] = z.string().optional();
    shape[`${invPrefix}_consultantApproval`] = z.enum(["Y", "N"]).default("N");
    shape[`${invPrefix}_remarks`] = z.string().optional();

    // Add component fields
    investigation.componentResults?.forEach((component) => {
      const fieldName = `component_${component.componentId}`;
      shape[fieldName] = createComponentValidation(component);
      shape[`${fieldName}_remarks`] = z.string().optional();
      shape[`${fieldName}_comments`] = z.string().optional();
    });
  });

  return z.object(shape);
};

const createComponentValidation = (component: ComponentResultDto) => {
  const { resultTypeId, componentName } = component;

  switch (resultTypeId) {
    case LCENT_ID.SINGLELINE_NUMERIC_VALUES:
    case LCENT_ID.REFERENCE_VALUES:
      return z
        .string()
        .nonempty(`${componentName} is required`)
        .refine((val) => !isNaN(Number(val)), {
          message: "Please enter a valid number",
        });

    case LCENT_ID.MULTIPLE_SELECTION:
      return z.string().nonempty(`Please select a value for ${componentName}`);

    default:
      return z.string().nonempty(`${componentName} is required`);
  }
};
