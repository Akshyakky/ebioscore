import { Healing as SurgicalIcon } from "@mui/icons-material";
import * as z from "zod";
import { GenericHistoryForm } from "./GenericHistoryForm";

const pastSurgicalHistorySchema = z.object({
  opipPshID: z.number().default(0),
  opipNo: z.number(),
  opvID: z.number().default(0),
  pChartID: z.number(),
  opipCaseNo: z.number().default(0),
  patOpip: z.string().length(1).default("I"),
  opipPshDate: z.date(),
  opipPshDesc: z.string().min(1, "PSH history description is required"),
  opipPshNotes: z.string().optional().nullable(),
  oldPChartID: z.number().default(0),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional().nullable(),
});

type PastSurgicalHistoryFormData = z.infer<typeof pastSurgicalHistorySchema>;

export const PastSurgicalHistoryForm = (props: any) => (
  <GenericHistoryForm<PastSurgicalHistoryFormData>
    {...props}
    title="Past Surgical History"
    icon={<SurgicalIcon color="primary" />}
    templateType="OPIPHISTPSH"
    formSchema={pastSurgicalHistorySchema}
    fields={{
      dateField: "opipPshDate",
      descField: "opipPshDesc",
      notesField: "opipPshNotes",
      activeField: "rActiveYN",
    }}
  />
);
