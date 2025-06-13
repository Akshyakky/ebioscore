import SmartButton from "@/components/Button/SmartButton";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { LCompTemplateDto } from "@/interfaces/Laboratory/InvestigationListDto";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Divider, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

export const templateValueSchema = z.object({
  cTID: z.number().optional(),
  tGroupID: z.number().min(1, "Please select a template group"),
  tGroupCode: z.string().nonempty("Please select a template group"),
  tGroupName: z.string().optional().nullable(),
  cTText: z.string().nonempty("Template text is required"),
  isBlankYN: z.string().optional().nullable(),
  compoID: z.number().optional().nullable(),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional().nullable(),
  invID: z.number().optional().nullable(),
});

type TemplateValueFormData = z.infer<typeof templateValueSchema>;

interface TemplateValueEntryTypeProps {
  invID: number;
  compoID: number;
  templateData: LCompTemplateDto | null;
  onUpdate: (data: LCompTemplateDto | null) => void;
}

const TemplateValueEntryType: React.FC<TemplateValueEntryTypeProps> = ({ invID, compoID, templateData, onUpdate }) => {
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const { templateGroup } = useDropdownValues(["templateGroup"]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<TemplateValueFormData>({
    defaultValues: {
      cTID: 0,
      tGroupID: 0,
      tGroupCode: "",
      tGroupName: "",
      cTText: "",
      isBlankYN: "N",
      compoID: compoID,
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
      invID: invID,
    },
    resolver: zodResolver(templateValueSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (templateData) {
      reset({
        cTID: templateData.cTID || 0,
        tGroupID: templateData.tGroupID || 0,
        tGroupCode: templateData.tGroupCode || "",
        tGroupName: templateData.tGroupName || "",
        cTText: templateData.cTText || "",
        isBlankYN: templateData.isBlankYN || "N",
        compoID: templateData.compoID || compoID,
        rActiveYN: templateData.rActiveYN || "Y",
        transferYN: templateData.transferYN || "N",
        rNotes: templateData.rNotes || "",
        invID: templateData.invID || invID,
      });
    } else {
      reset({
        cTID: 0,
        tGroupID: 0,
        tGroupCode: "",
        tGroupName: "",
        cTText: "",
        isBlankYN: "N",
        compoID: compoID,
        rActiveYN: "Y",
        transferYN: "N",
        rNotes: "",
        invID: invID,
      });
    }
  }, [templateData, compoID, invID, reset]);

  const handleSaveTemplate = (data: TemplateValueFormData) => {
    const templateValue: LCompTemplateDto = {
      cTID: data.cTID || 0,
      tGroupID: data.tGroupID,
      tGroupCode: data.tGroupCode || "",
      tGroupName: data.tGroupName || "",
      cTText: data.cTText || "",
      isBlankYN: data.isBlankYN || "N",
      compoID: compoID,
      rActiveYN: data.rActiveYN || "Y",
      transferYN: data.transferYN || "N",
      rNotes: data.rNotes || "",
      invID: invID,
    };

    onUpdate(templateValue);
  };

  const handleClearTemplate = () => {
    reset({
      cTID: 0,
      tGroupID: 0,
      tGroupCode: "",
      tGroupName: "",
      cTText: "",
      isBlankYN: "N",
      compoID: compoID,
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
      invID: invID,
    });
    onUpdate(null);
  };

  const watchedTGroupCode = watch("tGroupCode");

  useEffect(() => {
    if (watchedTGroupCode && templateGroup && templateGroup.length > 0) {
      const selectedGroup = templateGroup?.find((group) => group.bchCode === watchedTGroupCode);
      if (selectedGroup) {
        setValue("tGroupID", selectedGroup.bchID);
        setValue("tGroupName", selectedGroup.label);
      }
    }
  }, [watchedTGroupCode, templateGroup, setValue]);

  if (isLoading) {
    return (
      <Grid size={{ sm: 12 }}>
        <Typography variant="subtitle1" gutterBottom>
          Template Values [Alpha Numeric]
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Loading template groups...
        </Typography>
      </Grid>
    );
  }

  return (
    <Grid size={{ sm: 12 }}>
      <Typography variant="subtitle1" gutterBottom>
        Template Values [Alpha Numeric]
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          A component can have only one template. This template will be used in the lab report entry module.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ sm: 12, md: 6 }}>
          <FormField
            name="tGroupCode"
            control={control}
            label="Template Group"
            type="select"
            required
            size="small"
            options={templateGroup || []}
            fullWidth
            placeholder="Select a template group"
            helperText={errors.tGroupCode?.message}
            disabled={templateGroup?.length === 0}
          />
        </Grid>

        <Grid size={{ sm: 12, md: 6 }}>
          <FormField
            name="isBlankYN"
            control={control}
            label="Start with blank template"
            type="switch"
            size="small"
            helperText="When enabled, the template text will be cleared in the report entry"
          />
        </Grid>

        <Grid size={{ sm: 12 }}>
          <FormField
            name="cTText"
            control={control}
            label="Template Text"
            type="textarea"
            required
            size="small"
            fullWidth
            rows={6}
            placeholder="Enter the template text that will appear in the lab report entry module"
            helperText={errors.cTText?.message || "This template text will be pre-filled in the lab report entry"}
          />
        </Grid>

        <Grid size={{ sm: 12 }}>
          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            {templateData && <SmartButton text="Clear Template" onClick={handleClearTemplate} variant="outlined" color="error" size="small" />}
            <SmartButton
              text={templateData ? "Update Template" : "Save Template"}
              onClick={handleSubmit(handleSaveTemplate)}
              variant="contained"
              color="primary"
              size="small"
              disabled={!isDirty || !!errors.tGroupID || !!errors.cTText}
            />
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TemplateValueEntryType;
