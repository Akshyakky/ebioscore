import { FamilyRestroom as FamilyIcon } from "@mui/icons-material";
import * as z from "zod";
import { GenericHistoryForm } from "../Forms/GenericHistoryForm";

const familyHistorySchema = z.object({
  opipFHID: z.number().default(0),
  opipNo: z.number(),
  opvID: z.number().default(0),
  pChartID: z.number(),
  opipCaseNo: z.number().default(0),
  patOpip: z.string().length(1).default("I"),
  opipFHDate: z.date(),
  opipFHDesc: z.string().min(1, "Family history description is required"),
  opipFHNotes: z.string().optional().nullable(),
  oldPChartID: z.number().default(0),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional().nullable(),
});

type FamilyHistoryFormData = z.infer<typeof familyHistorySchema>;

export const FamilyHistoryForm = (props: any) => (
  <GenericHistoryForm<FamilyHistoryFormData>
    {...props}
    title="Family History"
    icon={<FamilyIcon color="primary" />}
    templateType="OPIPHISTFH"
    formSchema={familyHistorySchema}
    fields={{
      dateField: "opipFHDate",
      descField: "opipFHDesc",
      notesField: "opipFHNotes",
      activeField: "rActiveYN",
    }}
  />
);
