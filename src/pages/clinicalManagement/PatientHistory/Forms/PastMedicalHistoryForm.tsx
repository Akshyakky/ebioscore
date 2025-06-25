import { LocalHospital as PastMedicalIcon } from "@mui/icons-material";
import * as z from "zod";
import { GenericHistoryForm } from "./GenericHistoryForm";

const pastMedicalHistorySchema = z.object({
  opippmhId: z.number().default(0),
  opipNo: z.number(),
  opvID: z.number().default(0),
  pChartID: z.number(),
  opipCaseNo: z.number().default(0),
  patOpip: z.string().length(1).default("I"),
  opippmhDate: z.date(),
  opippmhDesc: z.string().min(1, "PMH history description is required"),
  opippmhNotes: z.string().optional().nullable(),
  oldPChartID: z.number().default(0),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional().nullable(),
});

type PastMedicalHistoryFormData = z.infer<typeof pastMedicalHistorySchema>;

export const PastMedicalHistoryForm = (props: any) => (
  <GenericHistoryForm<PastMedicalHistoryFormData>
    {...props}
    title="Past Medical History"
    icon={<PastMedicalIcon color="primary" />}
    templateType="OPIPHISTPMH"
    formSchema={pastMedicalHistorySchema}
    fields={{
      dateField: "opippmhDate",
      descField: "opippmhDesc",
      notesField: "opippmhNotes",
      activeField: "rActiveYN",
    }}
  />
);
