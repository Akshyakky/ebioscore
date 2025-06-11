import SmartButton from "@/components/Button/SmartButton";
import CustomGrid from "@/components/CustomGrid/CustomGrid";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { LCompMultipleDto } from "@/interfaces/Laboratory/InvestigationListDto";
import { zodResolver } from "@hookform/resolvers/zod";
import { Add, Delete, Edit } from "@mui/icons-material";
import { Chip, Divider, Grid, IconButton, Paper, Stack, Typography } from "@mui/material";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

export const multipleEntrySchema = z.object({
  cmID: z.number().optional(),
  cmValues: z.string().nonempty("Value is required"),
  compoID: z.number().optional().nullable(),
  invID: z.number().optional().nullable(),
  defaultYN: z.string().optional().nullable(),
  rActiveYN: z.string().optional().nullable(),
  transferYN: z.string().optional().nullable(),
  rNotes: z.string().optional().nullable(),
  isEditing: z.boolean().optional(),
});

type MultipleSelectionFormData = z.infer<typeof multipleEntrySchema>;

interface MultipleSelectionFormProps {
  invID: number;
  compoID: number;
  fields: LCompMultipleDto[];
  append: (value: LCompMultipleDto) => void;
  update: (index: number, value: LCompMultipleDto) => void;
  remove: (index: number) => void;
}

const MultipleSelectionEntryType: React.FC<MultipleSelectionFormProps> = ({ invID, compoID, fields, append, update, remove }) => {
  const {
    control: multipleControl,
    handleSubmit: handleMultipleSubmit,
    reset: resetMultiple,
    setValue,
    formState: { errors: multipleErrors },
  } = useForm<MultipleSelectionFormData>({
    defaultValues: {
      cmValues: "",
      defaultYN: "N",
    },
    resolver: zodResolver(multipleEntrySchema),
    mode: "onChange",
  });

  const handleAddMultipleEntry = (data: MultipleSelectionFormData) => {
    const newEntry: LCompMultipleDto = {
      cmID: 0,
      cmValues: data.cmValues || "",
      compoID: compoID || 0,
      invID: invID || 0,
      defaultYN: data.defaultYN || "N",
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
      isEditing: false,
    };

    append(newEntry);
    resetMultiple();
  };

  const handleEditMultipleEntry = (index: number) => {
    const entry = fields[index];
    if (!entry) return;
    resetMultiple({
      cmValues: entry.cmValues || "",
      defaultYN: entry.defaultYN || "N",
    });
    update(index, { ...entry, isEditing: true });
  };

  const handleUpdateMultipleEntry = (index: number, data: MultipleSelectionFormData) => {
    const entry = fields[index];
    if (!entry) return;
    update(index, {
      cmID: entry.cmID || 0,
      cmValues: data.cmValues || "",
      compoID: entry.compoID || 0,
      invID: entry.invID || 0,
      defaultYN: data.defaultYN || "N",
      rActiveYN: entry.rActiveYN || "Y",
      transferYN: entry.transferYN || "N",
      rNotes: entry.rNotes || "",
      isEditing: false,
    });
    resetMultiple();
  };

  const handleCancelEdit = () => {
    resetMultiple();
    const updatedFields = fields.map((field) => ({
      ...field,
      isEditing: false,
    }));
    updatedFields.forEach((field, index) => update(index, field));
  };

  const handleDeleteMultipleEntry = (index: number) => {
    remove(index);
  };

  return (
    <Grid size={{ sm: 12 }}>
      <Typography variant="subtitle1" gutterBottom>
        Multiple Choice Values
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ sm: 12, md: 6 }}>
            <FormField name="cmValues" control={multipleControl} label="Value" type="text" placeholder="Enter value" size="small" fullWidth required />
          </Grid>
          <Grid size={{ sm: 12, md: 3 }}>
            <FormField
              type="switch"
              label="Default Value"
              name="defaultYN"
              control={multipleControl}
              onChange={(value: string) => {
                setValue("defaultYN", value ? "Y" : "N");
              }}
            />
          </Grid>
          <Grid size={{ sm: 12, md: 3 }}>
            <Stack direction="row" spacing={1}>
              <SmartButton
                text={fields.some((field) => field.isEditing) ? "Update" : "Add"}
                onClick={handleMultipleSubmit((data) => {
                  const editingIndex = fields.findIndex((field) => field.isEditing);
                  if (editingIndex >= 0) {
                    handleUpdateMultipleEntry(editingIndex, data);
                  } else {
                    handleAddMultipleEntry(data);
                  }
                })}
                variant="contained"
                color="primary"
                icon={Add}
                disabled={!!multipleErrors.cmValues}
              />
              {fields.some((field) => field.isEditing) && <SmartButton text="Cancel" onClick={handleCancelEdit} variant="outlined" color="inherit" />}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {fields.length > 0 ? (
        <CustomGrid<LCompMultipleDto>
          columns={[
            {
              key: "index",
              header: "#",
              visible: true,
              render: (_, rowIndex) => rowIndex + 1,
              width: 60,
            },
            {
              key: "cmValues",
              header: "Value",
              visible: true,
              width: 200,
            },
            {
              key: "defaultYN",
              header: "Default",
              visible: true,
              render: (item) => <Chip size="small" label={item.defaultYN === "Y" ? "Yes" : "No"} color={item.defaultYN === "Y" ? "success" : "default"} variant="outlined" />,
              width: 100,
            },
            {
              key: "actions",
              header: "Actions",
              visible: true,
              render: (item, rowIndex) => (
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" color="primary" onClick={() => handleEditMultipleEntry(rowIndex)} disabled={fields.some((field) => field.isEditing)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteMultipleEntry(rowIndex)} disabled={fields.some((field) => field.isEditing)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              ),
              width: 120,
            },
          ]}
          data={fields}
          maxHeight="250px"
          density="small"
          rowKeyField="cmID"
        />
      ) : (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
          No values added yet. Add at least one value for multiple choice.
        </Typography>
      )}
    </Grid>
  );
};

export default MultipleSelectionEntryType;
