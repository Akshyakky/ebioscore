import SmartButton from "@/components/Button/SmartButton";
import CustomGrid from "@/components/CustomGrid/CustomGrid";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { LCompAgeRangeDto, LCompNormalDto } from "@/interfaces/Laboratory/InvestigationListDto";
import { zodResolver } from "@hookform/resolvers/zod";
import { Add, Delete, Edit, Settings } from "@mui/icons-material";
import { Chip, Divider, Grid, IconButton, Paper, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import AgeRangeForm from "../Form/AgeRangeForm";
import { useCompAgeRange } from "../hooks/useCompAgeRange";

export const referenceValueSchema = z
  .object({
    cnID: z.number().optional(),
    compoID: z.number().optional().nullable(),
    carID: z.number().min(1, "Please select an age range"),
    cnUpper: z.number(),
    cnLower: z.number(),
    cnApply: z.string().optional().nullable(),
    cnSex: z.string().optional().nullable(),
    cnAgeLmt: z.string().optional().nullable(),
    cnUnits: z.string().nonempty("Units are required"),
    rActiveYN: z.string().default("Y"),
    transferYN: z.string().default("N"),
    rNotes: z.string().optional().nullable(),
    isEditing: z.boolean().optional(),
  })
  .refine((data) => data.cnUpper >= data.cnLower, {
    message: "Upper limit must be greater than or equal to lower limit",
    path: ["cnUpper"],
  });

type ReferenceValueFormData = z.infer<typeof referenceValueSchema>;

interface ReferenceValueEntryTypeProps {
  compoID: number;
  fields: LCompNormalDto[];
  append: (value: LCompNormalDto) => void;
  update: (index: number, value: LCompNormalDto) => void;
  remove: (index: number) => void;
  defaultUnit?: string;
}

const ReferenceValueEntryType: React.FC<ReferenceValueEntryTypeProps> = ({ compoID, fields, append, update, remove, defaultUnit = "" }) => {
  const [isAgeRangeFormOpen, setIsAgeRangeFormOpen] = useState(false);
  const [selectedAgeRange] = useState<LCompAgeRangeDto | null>(null);
  const { ageRangeList, fetchAgeRangeList, saveAgeRange } = useCompAgeRange();
  const {
    control: refControl,
    handleSubmit: handleRefSubmit,
    reset: resetRef,
    setValue,
    watch,
    formState: { errors: refErrors },
  } = useForm<ReferenceValueFormData>({
    defaultValues: {
      carID: 0,
      cnUpper: 0,
      cnLower: 0,
      cnUnits: defaultUnit,
      rActiveYN: "Y",
    },
    resolver: zodResolver(referenceValueSchema),
    mode: "onChange",
  });

  const watchedCarID = watch("carID");

  // Update form fields when age range is selected
  useEffect(() => {
    if (watchedCarID && ageRangeList.length > 0) {
      const selectedRange = ageRangeList.find((range) => range.carID === watchedCarID);
      if (selectedRange) {
        setValue("cnApply", selectedRange.carName);
        setValue("cnSex", selectedRange.carSex);
        setValue("cnAgeLmt", selectedRange.cappName);
      }
    }
  }, [watchedCarID, ageRangeList, setValue]);

  const handleAddReferenceValue = (data: ReferenceValueFormData) => {
    const newEntry: LCompNormalDto = {
      cnID: 0,
      compoID: compoID || 0,
      carID: data.carID || 0,
      cnUpper: data.cnUpper,
      cnLower: data.cnLower,
      cnApply: data.cnApply || "",
      cnSex: data.cnSex || "",
      cnAgeLmt: data.cnAgeLmt || "",
      cnUnits: data.cnUnits || "",
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: data.rNotes || "",
    };

    append(newEntry);
    resetRef();
  };

  const handleEditReferenceValue = (index: number) => {
    const entry = fields[index];
    if (!entry) return;
    resetRef({
      carID: entry.carID || 0,
      cnUpper: entry.cnUpper,
      cnLower: entry.cnLower,
      cnApply: entry.cnApply || "",
      cnSex: entry.cnSex || "",
      cnAgeLmt: entry.cnAgeLmt || "",
      cnUnits: entry.cnUnits || "",
      rActiveYN: entry.rActiveYN || "Y",
      rNotes: entry.rNotes || "",
      isEditing: true,
    });
    update(index, { ...entry, isEditing: true });
  };

  const handleUpdateReferenceValue = (index: number, data: ReferenceValueFormData) => {
    const entry = fields[index];
    if (!entry) return;
    update(index, {
      cnID: entry.cnID || 0,
      compoID: entry.compoID || 0,
      carID: data.carID || 0,
      cnUpper: data.cnUpper,
      cnLower: data.cnLower,
      cnApply: data.cnApply || "",
      cnSex: data.cnSex || "",
      cnAgeLmt: data.cnAgeLmt || "",
      cnUnits: data.cnUnits || "",
      rActiveYN: data.rActiveYN || "Y",
      transferYN: entry.transferYN || "N",
      rNotes: data.rNotes || "",
      isEditing: false,
    });
    resetRef();
  };

  const handleCancelEdit = () => {
    resetRef();
    const updatedFields = fields.map((field) => ({
      ...field,
      isEditing: false,
    }));
    updatedFields.forEach((field, index) => update(index, field));
  };

  const handleDeleteReferenceValue = (index: number) => {
    remove(index);
  };

  const handleSaveAgeRange = async (ageRangeData: LCompAgeRangeDto) => {
    const result = await saveAgeRange(ageRangeData);
    if (result.success) {
      await fetchAgeRangeList();
      setIsAgeRangeFormOpen(false);
    }
  };

  // Create age range options for dropdown
  const ageRangeOptions = ageRangeList.map((range) => ({
    value: range.carID,
    label: range.cappName || "",
  }));

  return (
    <>
      <Grid size={{ sm: 12 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle1">Reference Values [Numeric Only]</Typography>
          <SmartButton text="Manage Age Ranges" icon={Settings} onClick={() => setIsAgeRangeFormOpen(true)} variant="outlined" size="small" />
        </Stack>
        <Divider sx={{ mb: 2 }} />

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid size={{ sm: 12, md: 4 }}>
              <FormField
                name="carID"
                control={refControl}
                label="Age Range / Demographic"
                type="select"
                required
                size="small"
                options={ageRangeOptions}
                fullWidth
                helperText={refErrors.carID?.message}
              />
            </Grid>
            <Grid size={{ sm: 12, md: 3 }}>
              <FormField name="cnLower" control={refControl} label="Lower Limit" type="number" required size="small" fullWidth helperText={refErrors.cnLower?.message} />
            </Grid>
            <Grid size={{ sm: 12, md: 3 }}>
              <FormField name="cnUpper" control={refControl} label="Upper Limit" type="number" required size="small" fullWidth helperText={refErrors.cnUpper?.message} />
            </Grid>
            <Grid size={{ sm: 12, md: 2 }}>
              <Typography>{defaultUnit}</Typography>
              {/* <FormField
                name="cnUnits"
                control={refControl}
                label="Units"
                type="select"
                required
                size="small"
                options={unitOptions}
                fullWidth
                helperText={refErrors.cnUnits?.message}
              /> */}
            </Grid>
            <Grid size={{ sm: 12, md: 8 }}>
              <FormField name="rNotes" control={refControl} label="Notes" type="text" placeholder="e.g., Fasting Sample Required" size="small" fullWidth />
            </Grid>
            <Grid size={{ sm: 12, md: 4 }}>
              <Stack direction="row" spacing={1}>
                <SmartButton
                  text={fields.some((field) => field.isEditing) ? "Update" : "Add"}
                  onClick={handleRefSubmit((data) => {
                    const editingIndex = fields.findIndex((field) => field.isEditing);
                    if (editingIndex >= 0) {
                      handleUpdateReferenceValue(editingIndex, data);
                    } else {
                      handleAddReferenceValue(data);
                    }
                  })}
                  variant="contained"
                  color="primary"
                  icon={Add}
                  disabled={!!refErrors.carID || !!refErrors.cnLower || !!refErrors.cnUpper || !!refErrors.cnUnits}
                />
                {fields.some((field) => field.isEditing) && <SmartButton text="Cancel" onClick={handleCancelEdit} variant="outlined" color="inherit" />}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {fields.length > 0 ? (
          <CustomGrid<LCompNormalDto>
            columns={[
              {
                key: "index",
                header: "#",
                visible: true,
                render: (_, rowIndex) => rowIndex + 1,
                width: 60,
              },
              {
                key: "cnAgeLmt",
                header: "Age Range",
                visible: true,
                width: 180,
              },
              {
                key: "cnSex",
                header: "Sex",
                visible: true,
                width: 100,
                render: (item) => (
                  <Chip size="small" label={item.cnSex || "Both"} color={item.cnSex === "Male" ? "info" : item.cnSex === "Female" ? "secondary" : "default"} variant="outlined" />
                ),
              },
              {
                key: "range",
                header: "Reference Range",
                visible: true,
                render: (item) => `${item.cnLower} - ${item.cnUpper} ${item.cnUnits}`,
                width: 200,
              },
              {
                key: "rNotes",
                header: "Notes",
                visible: true,
                width: 200,
                render: (item) => item.rNotes || "-",
              },
              {
                key: "actions",
                header: "Actions",
                visible: true,
                render: (_item, rowIndex) => (
                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" color="primary" onClick={() => handleEditReferenceValue(rowIndex)} disabled={fields.some((field) => field.isEditing)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteReferenceValue(rowIndex)} disabled={fields.some((field) => field.isEditing)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                ),
                width: 120,
              },
            ]}
            data={fields}
            maxHeight="300px"
            density="small"
            rowKeyField="cnID"
          />
        ) : (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
            No reference values added yet. Add at least one reference value for this component.
          </Typography>
        )}
      </Grid>

      {isAgeRangeFormOpen && <AgeRangeForm open={isAgeRangeFormOpen} onClose={() => setIsAgeRangeFormOpen(false)} onSave={handleSaveAgeRange} initialData={selectedAgeRange} />}
    </>
  );
};

export default ReferenceValueEntryType;
