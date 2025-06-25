import { Psychology as ReviewIcon } from "@mui/icons-material";
import * as z from "zod";
import { GenericHistoryForm } from "./GenericHistoryForm";

const reviewOfSystemSchema = z.object({
  opipRosID: z.number().default(0),
  opipNo: z.number(),
  opvID: z.number().default(0),
  pChartID: z.number(),
  opipCaseNo: z.number().default(0),
  patOpip: z.string().length(1).default("I"),
  opipRosDate: z.date(),
  opipRosDesc: z.string().min(1, "Ros history description is required"),
  opipRosNotes: z.string().optional().nullable(),
  oldPChartID: z.number().default(0),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional().nullable(),
});

type ReviewOfSystemFormData = z.infer<typeof reviewOfSystemSchema>;

export const ReviewOfSystemForm = (props: any) => (
  <GenericHistoryForm<ReviewOfSystemFormData>
    {...props}
    title="Review of System"
    icon={<ReviewIcon color="primary" />}
    templateType="OPIPHISTROS"
    formSchema={reviewOfSystemSchema}
    fields={{
      dateField: "opipRosDate",
      descField: "opipRosDesc",
      notesField: "opipRosNotes",
      activeField: "rActiveYN",
    }}
  />
);
