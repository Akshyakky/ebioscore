import React, { useEffect } from "react";
import { Box, Grid, Typography, Divider } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { LComponentDto } from "@/interfaces/Laboratory/InvestigationListDto";
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
  invName: z.string().nonempty("Investigation name is required"),
  mGrpID: z.number().optional().nullable(),
  mGrpName: z.string().optional().nullable(),
  stitID: z.number().optional().nullable(),
  stitName: z.string().optional().nullable(),
  compInterpret: z.string().optional().nullable(),
  compUnit: z.string().optional().nullable(),
  compOrder: z.number().optional().nullable(),
  lCentID: z.number().min(1, "Entry type is required"),
  lCentName: z.string(),
  lCentType: z.string(),
  compDetailYN: z.string(),
  deltaValPercent: z.number().optional().nullable(),
  compoCode: z.string().optional().nullable(),
  compoID: z.number().min(1, "Component is required"),
  compoName: z.string(),
  compoTitle: z.string().optional().nullable(),
  invCode: z.string().optional().nullable(),
  cNHSCode: z.string().optional().nullable(),
  cNHSEnglishName: z.string().optional().nullable(),
  cNHSGreekName: z.string().optional().nullable(),
  cShortName: z.string().optional().nullable(),
  rActiveYN: z.string(),
  transferYN: z.string(),
  rNotes: z.string().optional().nullable(),
});

type ComponentFormData = z.infer<typeof schema>;

const ComponentForm: React.FC<ComponentFormProps> = ({ open, onClose, onSave, initialData, invID }) => {
  const [entryTypes, setEntryTypes] = React.useState<any[]>([]);

  const defaultValues: ComponentFormData = {
    invID: invID,
    invName: "",
    mGrpID: null,
    mGrpName: "",
    stitID: null,
    stitName: "",
    compInterpret: "",
    compUnit: "",
    compOrder: 1,
    lCentID: 0,
    lCentName: "",
    lCentType: "",
    compDetailYN: "N",
    deltaValPercent: null,
    compoCode: "",
    compoID: 0,
    compoName: "",
    compoTitle: "",
    invCode: "",
    cNHSCode: "",
    cNHSEnglishName: "",
    cNHSGreekName: "",
    cShortName: "",
    rActiveYN: "Y",
    transferYN: "N",
    rNotes: "",
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
    const componentData: LComponentDto = {
      ...data,
      invID: invID,
      invName: data.invName || "",
      mGrpID: data.mGrpID || 0,
      mGrpName: data.mGrpName || "",
      stitID: data.stitID || 0,
      stitName: data.stitName || "",
      compInterpret: data.compInterpret || "",
      compUnit: data.compUnit || "",
      compOrder: data.compOrder || 0,
      lCentID: data.lCentID || 0,
      lCentName: data.lCentName || "",
      lCentType: data.lCentType || "",
      compDetailYN: data.compDetailYN || "",
      deltaValPercent: data.deltaValPercent || 0,
      compoCode: data.compoCode || "",
      compoID: data.compoID || 0,
      compoName: data.compoName || "",
      compoTitle: data.compoTitle || "",
      invCode: data.invCode || "",
      cNHSCode: data.cNHSCode || "",
      cNHSEnglishName: data.cNHSEnglishName || "",
      cNHSGreekName: data.cNHSGreekName || "",
      cShortName: data.cShortName || "",
      rActiveYN: data.rActiveYN || "Y",
      transferYN: data.transferYN || "N",
      rNotes: data.rNotes || "",
    };
    onSave(componentData);
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
                      setValue("lCentName", selectedType.label);
                      setValue("lCentType", selectedType.type);
                    }
                  }}
                />
              </Grid>
              <Grid size={{ sm: 12, md: 6 }}>
                <FormField name="compUnitCD" control={control} label="Unit" type="text" size="small" fullWidth />
              </Grid>
              <Grid size={{ sm: 12, md: 6 }}></Grid>
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
