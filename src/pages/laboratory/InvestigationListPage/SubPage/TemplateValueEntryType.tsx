import SmartButton from "@/components/Button/SmartButton";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { LCompTemplateDto } from "@/interfaces/Laboratory/InvestigationListDto";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Divider, Grid, Typography } from "@mui/material";
import { debounce } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

export const templateValueSchema = z.object({
  cTID: z.number().optional().nullable(),
  tGroupID: z.number().min(1, "Please select a template group"),
  tGroupCode: z.string().optional().nullable(),
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

  // Use ref to track if we're updating from parent
  const isUpdatingFromParent = useRef(false);

  const {
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
    getValues,
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

  // Create a debounced update function
  const debouncedUpdate = useRef(
    debounce((formData: TemplateValueFormData) => {
      const templateValue: LCompTemplateDto = {
        cTID: formData.cTID || 0,
        tGroupID: formData.tGroupID,
        tGroupCode: formData.tGroupCode || "",
        tGroupName: formData.tGroupName || "",
        cTText: formData.cTText,
        isBlankYN: formData.isBlankYN || "N",
        compoID: compoID,
        rActiveYN: "Y",
        transferYN: "N",
        rNotes: formData.rNotes || "",
        invID: invID,
      };
      onUpdate(templateValue);
    }, 500) // Debounce for 500ms
  ).current;

  // Update form when templateData changes from parent
  useEffect(() => {
    isUpdatingFromParent.current = true;

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

    // Reset flag after a short delay
    setTimeout(() => {
      isUpdatingFromParent.current = false;
    }, 100);
  }, [templateData, compoID, invID, reset]);

  // Watch specific fields for auto-save
  const watchedTGroupID = watch("tGroupID");
  const watchedCTText = watch("cTText");
  const watchedIsBlankYN = watch("isBlankYN");

  // Auto-save with debouncing
  useEffect(() => {
    // Skip if we're updating from parent or if required fields are not set
    if (isUpdatingFromParent.current || !watchedTGroupID || !watchedCTText) {
      return;
    }

    // Get all current form values
    const currentValues = getValues();

    // Call debounced update
    debouncedUpdate(currentValues);
  }, [watchedTGroupID, watchedCTText, watchedIsBlankYN, getValues, debouncedUpdate]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

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

  // Create properly formatted options for the dropdown
  const templateGroupOptions = React.useMemo(() => {
    if (!templateGroup || templateGroup.length === 0) return [];
    return templateGroup.map((group) => ({
      value: group.bchID || group.id || group.value,
      label: group.label || group.bchName || "",
    }));
  }, [templateGroup]);

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
            name="tGroupID"
            control={control}
            label="Template Group"
            type="select"
            required
            size="small"
            options={templateGroupOptions}
            fullWidth
            placeholder="Select a template group"
            helperText={errors.tGroupID?.message}
            disabled={templateGroupOptions.length === 0}
            onChange={(value: any) => {
              const selectedGroup = templateGroup?.find((group) => (group.bchID || group.id || group.value) === value.value);
              if (selectedGroup) {
                setValue("tGroupCode", selectedGroup.bchCode || selectedGroup.code || "");
                setValue("tGroupName", selectedGroup.label || selectedGroup.bchName || "");
              }
            }}
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
            <Typography variant="body2" color="text.secondary">
              Template will be automatically saved
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TemplateValueEntryType;
