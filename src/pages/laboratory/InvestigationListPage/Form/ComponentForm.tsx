import React, { useEffect } from "react";
import { Box, Grid, Typography, Divider } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { LComponentDto } from "@/interfaces/Laboratory/InvestigationListDto";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { componentEntryTypeService } from "@/services/Laboratory/LaboratoryService";

interface ComponentFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (componentData: LComponentDto) => void;
  initialData: LComponentDto | null;
  invID: number;
}

const schema = z.object({
  invID: z.number(),
  invNameCD: z.string().nonempty("Investigation name is required"),
  mGrpID: z.number().optional().nullable(),
  mGrpNameCD: z.string().optional().nullable(),
  stitID: z.number().optional().nullable(),
  stitNameCD: z.string().optional().nullable(),
  compInterpretCD: z.string().optional().nullable(),
  compUnitCD: z.string().optional().nullable(),
  compOrder: z.number().optional().nullable(),
  lCentID: z.number().min(1, "Entry type is required"),
  lCentNameCD: z.string(),
  lCentTypeCD: z.string(),
  compDetailYN: z.string(),
  deptID: z.number().min(1, "Department is required"),
  deptNameCD: z.string().optional().nullable(),
  deltaValPercent: z.number().optional().nullable(),
  compOCodeCD: z.string().optional().nullable(),
  compoID: z.number().min(1, "Component is required"),
  compoNameCD: z.string(),
  compoTitleCD: z.string().optional().nullable(),
  invCodeCD: z.string().optional().nullable(),
  cNHSCodeCD: z.string().optional().nullable(),
  cNHSEnglishNameCD: z.string().optional().nullable(),
  cNHSGreekNameCD: z.string().optional().nullable(),
  cShortNameCD: z.string().optional().nullable(),
  rActiveYN: z.string(),
  transferYN: z.string(),
  rNotes: z.string().optional().nullable(),
  indexID: z.number().optional().nullable(),
});

type ComponentFormData = z.infer<typeof schema>;

const ComponentForm: React.FC<ComponentFormProps> = ({ open, onClose, onSave, initialData, invID }) => {
  const { department } = useDropdownValues(["department"]);
  const [entryTypes, setEntryTypes] = React.useState<any[]>([]);

  const defaultValues: ComponentFormData = {
    invID: invID,
    invNameCD: "",
    mGrpID: null,
    mGrpNameCD: "",
    stitID: null,
    stitNameCD: "",
    compInterpretCD: "",
    compUnitCD: "",
    compOrder: 1,
    lCentID: 0,
    lCentNameCD: "",
    lCentTypeCD: "",
    compDetailYN: "N",
    deptID: 0,
    deptNameCD: "",
    deltaValPercent: null,
    compOCodeCD: "",
    compoID: Date.now(), // Temporary ID for new components
    compoNameCD: "",
    compoTitleCD: "",
    invCodeCD: "",
    cNHSCodeCD: "",
    cNHSEnglishNameCD: "",
    cNHSGreekNameCD: "",
    cShortNameCD: "",
    rActiveYN: "Y",
    transferYN: "N",
    rNotes: "",
    indexID: 0,
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<ComponentFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({ ...defaultValues, invID });
    }
  }, [initialData, invID, reset]);

  useEffect(() => {
    const fetchEntryTypes = async () => {
      try {
        const result = await componentEntryTypeService.getAll();
        if (result.success && result.data) {
          const options = result.data.map((item: any) => ({
            value: item.lCentID,
            label: item.lCentName,
            type: item.lCentType,
          }));
          setEntryTypes(options);
        }
      } catch (error) {
        console.error("Error fetching entry types:", error);
      }
    };
    fetchEntryTypes();
  }, []);

  const onSubmit = (data: ComponentFormData) => {
    // const componentData: LComponentDto = {
    //   ...data,
    //   invID: invID,
    //   indexID: data.indexID || 0,
    // };
    // onSave(componentData);
  };

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={initialData ? "Edit Component" : "Add Component"}
      maxWidth="md"
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
          {/* Component Information */}
          <Grid size={{ sm: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              Component Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid size={{ sm: 12, md: 8 }}>
                <FormField name="compoNameCD" control={control} label="Component Name" type="text" required size="small" fullWidth />
              </Grid>
              <Grid size={{ sm: 12, md: 4 }}>
                <FormField name="compOrder" control={control} label="Display Order" type="number" size="small" fullWidth />
              </Grid>
              <Grid size={{ sm: 12, md: 6 }}>
                <FormField name="compoTitleCD" control={control} label="Component Title" type="text" size="small" fullWidth />
              </Grid>
              <Grid size={{ sm: 12, md: 6 }}>
                <FormField name="cShortNameCD" control={control} label="Short Name" type="text" size="small" fullWidth />
              </Grid>
            </Grid>
          </Grid>

          {/* Settings */}
          <Grid size={{ sm: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              Component Settings
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid size={{ sm: 12, md: 6 }}>
                <FormField
                  name="lCentID"
                  control={control}
                  label="Entry Type"
                  type="select"
                  required
                  size="small"
                  options={entryTypes}
                  fullWidth
                  onChange={(value) => {
                    const selectedType = entryTypes.find((type) => Number(type.value) === Number(value.value));
                    if (selectedType) {
                      setValue("lCentNameCD", selectedType.label);
                      setValue("lCentTypeCD", selectedType.type);
                    }
                  }}
                />
              </Grid>
              <Grid size={{ sm: 12, md: 6 }}>
                <FormField name="compUnitCD" control={control} label="Unit" type="text" size="small" fullWidth />
              </Grid>
              <Grid size={{ sm: 12, md: 6 }}>
                <FormField
                  name="deptID"
                  control={control}
                  label="Department"
                  type="select"
                  required
                  size="small"
                  options={department}
                  fullWidth
                  onChange={(value) => {
                    const selectedDept = department?.find((dept) => Number(dept.value) === Number(value.value));
                    setValue("deptNameCD", selectedDept?.label || "");
                  }}
                />
              </Grid>
              <Grid size={{ sm: 12, md: 6 }}>
                <FormField name="deltaValPercent" control={control} label="Delta Value (%)" type="number" size="small" fullWidth />
              </Grid>
              <Grid size={{ sm: 12, md: 4 }}>
                <FormField name="compDetailYN" control={control} label="Detail Required" type="switch" size="small" />
              </Grid>
              <Grid size={{ sm: 12, md: 4 }}>
                <FormField name="rActiveYN" control={control} label="Active" type="switch" size="small" />
              </Grid>
            </Grid>
          </Grid>

          {/* Notes */}
          <Grid size={{ sm: 12 }}>
            <FormField name="rNotes" control={control} label="Notes" type="textarea" size="small" fullWidth rows={3} />
          </Grid>
        </Grid>
      </Box>
    </GenericDialog>
  );
};

export default ComponentForm;
