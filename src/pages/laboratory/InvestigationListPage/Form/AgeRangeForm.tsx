import SmartButton from "@/components/Button/SmartButton";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { LCompAgeRangeDto } from "@/interfaces/Laboratory/InvestigationListDto";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Divider, Grid, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface AgeRangeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: LCompAgeRangeDto) => void;
  initialData: LCompAgeRangeDto | null;
}

const ageRangeSchema = z
  .object({
    carID: z.number().optional(),
    carName: z.string().nonempty("Age range name is required"),
    carSex: z.string().default("Both"),
    carSexValue: z.string().optional(),
    carStart: z.number().min(0, "Start age must be non-negative"),
    carEnd: z.number().min(0, "End age must be non-negative"),
    carAgeType: z.string().default("Years"),
    carAgeValue: z.string().optional(),
    cappName: z.string().optional(),
    cappOrder: z.number().optional(),
    rActiveYN: z.string().default("Y"),
    transferYN: z.string().default("N"),
    rNotes: z.string().optional().nullable(),
  })
  .refine((data) => data.carEnd >= data.carStart, {
    message: "End age must be greater than or equal to start age",
    path: ["carEnd"],
  });

type AgeRangeFormData = z.infer<typeof ageRangeSchema>;

const AgeRangeForm: React.FC<AgeRangeFormProps> = ({ open, onClose, onSave, initialData }) => {
  const sexOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Both", label: "Both" },
  ];

  const ageTypeOptions = [
    { value: "Days", label: "Days" },
    { value: "Months", label: "Months" },
    { value: "Years", label: "Years" },
  ];

  const defaultValues: AgeRangeFormData = {
    carID: 0,
    carName: "",
    carSex: "Both",
    carSexValue: "",
    carStart: 0,
    carEnd: 0,
    carAgeType: "Years",
    carAgeValue: "",
    cappName: "",
    cappOrder: 0,
    rActiveYN: "Y",
    transferYN: "N",
    rNotes: "",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isValid, errors },
  } = useForm<AgeRangeFormData>({
    defaultValues,
    resolver: zodResolver(ageRangeSchema),
    mode: "onChange",
  });

  // Watch fields to generate cappName
  const watchedFields = watch(["carName", "carAgeType", "carStart", "carEnd", "carSex"]);

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset(defaultValues);
    }
  }, [initialData, reset]);

  // Generate cappName automatically
  useEffect(() => {
    const [carName, ageType, start, end, sex] = watchedFields;
    if (ageType && start !== undefined && end !== undefined) {
      const cappName = `${carName} ${sex} ${start}-${end} ${ageType}`;
      setValue("cappName", cappName);
    }
  }, [watchedFields, setValue]);

  const onSubmit = (data: AgeRangeFormData) => {
    const ageRangeData: LCompAgeRangeDto = {
      carID: data.carID || 0,
      carName: data.carName || "",
      carSex: data.carSex || "Both",
      carSexValue: data.carSex === "Male" ? "M" : data.carSex === "Female" ? "F" : "B",
      carStart: data.carStart,
      carEnd: data.carEnd,
      carAgeType: data.carAgeType || "Years",
      carAgeValue: data.carAgeType === "Years" ? "YRS" : data.carAgeType === "Months" ? "MOS" : "DYS",
      cappName: data.cappName || "",
      cappOrder: data.cappOrder || 0,
      rActiveYN: data.rActiveYN || "Y",
      transferYN: data.transferYN || "N",
      rNotes: data.rNotes || "",
    };
    onSave(ageRangeData);
  };

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={initialData ? "Edit Age Range" : "Add New Age Range"}
      maxWidth="sm"
      fullWidth
      actions={
        <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <SmartButton text="Cancel" onClick={onClose} variant="outlined" color="inherit" />
          <SmartButton text={initialData ? "Update" : "Add"} onClick={handleSubmit(onSubmit)} variant="contained" color="primary" disabled={!isValid} />
        </Box>
      }
    >
      <Box sx={{ p: 2 }}>
        <Grid container spacing={3}>
          <Grid size={{ sm: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              Age Range Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid size={{ sm: 12 }}>
                <FormField name="carName" control={control} label="Age Range Name" type="text" placeholder="e.g., Adults, Children, Elderly" required size="small" fullWidth />
              </Grid>

              <Grid size={{ sm: 12, md: 6 }}>
                <FormField name="carSex" control={control} label="Sex" type="select" required size="small" options={sexOptions} fullWidth />
              </Grid>

              <Grid size={{ sm: 12, md: 6 }}>
                <FormField name="carAgeType" control={control} label="Age Unit" type="select" required size="small" options={ageTypeOptions} fullWidth />
              </Grid>

              <Grid size={{ sm: 12, md: 6 }}>
                <FormField name="carStart" control={control} label="Starting Age" type="number" required size="small" fullWidth helperText={errors.carStart?.message} />
              </Grid>

              <Grid size={{ sm: 12, md: 6 }}>
                <FormField name="carEnd" control={control} label="Ending Age" type="number" required size="small" fullWidth helperText={errors.carEnd?.message} />
              </Grid>

              <Grid size={{ sm: 12 }}>
                <FormField
                  name="cappName"
                  control={control}
                  label="Generated Caption"
                  type="text"
                  disabled
                  size="small"
                  fullWidth
                  helperText="Auto-generated based on your selections"
                />
              </Grid>

              <Grid size={{ sm: 12 }}>
                <FormField name="rNotes" control={control} label="Notes" type="textarea" size="small" fullWidth rows={3} placeholder="Any additional notes about this age range" />
              </Grid>

              <Grid size={{ sm: 12 }}>
                <FormField name="rActiveYN" control={control} label="Active" type="switch" size="small" />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </GenericDialog>
  );
};

export default AgeRangeForm;
