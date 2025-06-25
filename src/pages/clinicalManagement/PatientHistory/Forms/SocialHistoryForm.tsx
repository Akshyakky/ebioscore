import { Assignment as SocialIcon } from "@mui/icons-material";
import * as z from "zod";
import { GenericHistoryForm } from "./GenericHistoryForm";

const socialHistorySchema = z.object({
  opipSHID: z.number().default(0),
  opipNo: z.number(),
  opvID: z.number().default(0),
  pChartID: z.number(),
  opipCaseNo: z.number().default(0),
  patOpip: z.string().length(1).default("I"),
  opipSHDate: z.date(),
  opipSHDesc: z.string().min(1, "Social history description is required"),
  opipSHNotes: z.string().optional().nullable(),
  oldPChartID: z.number().default(0),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional().nullable(),
});

type SocialHistoryFormData = z.infer<typeof socialHistorySchema>;

export const SocialHistoryForm = (props: any) => (
  <GenericHistoryForm<SocialHistoryFormData>
    {...props}
    title="Social History"
    icon={<SocialIcon color="primary" />}
    templateType="OPIPHISTSH"
    formSchema={socialHistorySchema}
    fields={{
      dateField: "opipSHDate",
      descField: "opipSHDesc",
      notesField: "opipSHNotes",
      activeField: "rActiveYN",
    }}
  />
);
