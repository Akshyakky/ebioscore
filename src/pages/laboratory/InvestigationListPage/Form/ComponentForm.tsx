import SmartButton from "@/components/Button/SmartButton";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { LCompMultipleDto, LCompNormalDto, LComponentDto, LCompTemplateDto } from "@/interfaces/Laboratory/InvestigationListDto";

import { componentEntryTypeService } from "@/services/Laboratory/LaboratoryService";
import { LCENT_ID } from "@/types/lCentConstants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Divider, Grid, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import MultipleSelectionEntryType, { multipleEntrySchema } from "../SubPage/MultipleSelectionEntryType";
import ReferenceValueEntryType, { referenceValueSchema } from "../SubPage/ReferenceValueEntryType";
import TemplateValueEntryType, { templateValueSchema } from "../SubPage/TemplateValueEntryType";
interface ComponentFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (componentData: LComponentDto) => void;
  initialData: LComponentDto | null;
  invID: number;
}

// Main schema
const schema = z.object({
  compoID: z.number().optional().nullable(),
  compoCode: z.string().optional().nullable(),
  compoName: z.string().nonempty("Component name is required"),
  compoTitle: z.string().optional().nullable(),
  invID: z.number().optional().nullable(),
  mGrpID: z.number().optional().nullable(),
  mGrpCode: z.string().optional().nullable(),
  mGrpName: z.string().optional().nullable(),
  stitID: z.number().optional().nullable(),
  stitCode: z.string().optional().nullable(),
  stitName: z.string().optional().nullable(),
  compInterpret: z.string().optional().nullable(),
  compUnit: z.string().optional().nullable(),
  compOrder: z.number().optional().nullable(),
  lCentID: z.number().optional().nullable(),
  lCentName: z.string().optional().nullable(),
  lCentType: z.string().optional().nullable(),
  compDetailYN: z.string().optional().nullable(),
  deltaValPercent: z.number().optional().nullable(),
  cNHSCode: z.string().optional().nullable(),
  cNHSEnglishName: z.string().optional().nullable(),
  cNHSGreekName: z.string().optional().nullable(),
  cShortName: z.string().optional().nullable(),
  rActiveYN: z.string().optional().nullable(),
  transferYN: z.string().optional().nullable(),
  rNotes: z.string().optional().nullable(),
  compoMethod: z.string().optional().nullable(),
  compoSample: z.string().optional().nullable(),
  lCompMultipleDto: z.array(multipleEntrySchema).optional(),
  lCompNormalDto: z.array(referenceValueSchema).optional(),
  lCompTemplateDto: templateValueSchema.optional().nullable(),
});

type ComponentFormData = z.infer<typeof schema>;

const ComponentForm: React.FC<ComponentFormProps> = ({ open, onClose, onSave, initialData, invID }) => {
  const [entryTypes, setEntryTypes] = React.useState<any[]>([]);
  const [templateData, setTemplateData] = React.useState<LCompTemplateDto | null>(null);
  const { componentUnit, mainGroup, subTitle } = useDropdownValues(["componentUnit", "mainGroup", "subTitle"]);
  const defaultValues: ComponentFormData = {
    compoID: 0,
    compoCode: "",
    compoName: "",
    compoTitle: "",
    invID: invID,
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
    cNHSCode: "",
    cNHSEnglishName: "",
    cNHSGreekName: "",
    cShortName: "",
    rActiveYN: "Y",
    transferYN: "N",
    rNotes: "",
    lCompMultipleDto: [],
    lCompNormalDto: [],
    lCompTemplateDto: null,
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isValid },
  } = useForm<ComponentFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  // Use useFieldArray for managing multiple entries
  const {
    fields: multipleFields,
    append: appendMultiple,
    update: updateMultiple,
    remove: removeMultiple,
  } = useFieldArray({
    control,
    name: "lCompMultipleDto",
  });

  // Use useFieldArray for managing reference values
  const {
    fields: referenceFields,
    append: appendReference,
    update: updateReference,
    remove: removeReference,
  } = useFieldArray({
    control,
    name: "lCompNormalDto",
  });

  const typedMultipleFields = multipleFields.map((field) => ({
    ...field,
    cmID: field.cmID || 0,
    cmValues: field.cmValues || "",
    compoID: field.compoID || 0,
    invID: field.invID || 0,
    defaultYN: field.defaultYN || "N",
    rActiveYN: field.rActiveYN || "Y",
    transferYN: field.transferYN || "N",
    rNotes: field.rNotes || "",
    isEditing: field.isEditing || false,
  }));

  const typedReferenceFields = referenceFields.map((field) => ({
    ...field,
    cnID: field.cnID || 0,
    compoID: field.compoID || 0,
    carID: field.carID || 0,
    cnUpper: field.cnUpper || 0,
    cnLower: field.cnLower || 0,
    cnApply: field.cnApply || "",
    cnSex: field.cnSex || "",
    cnAgeLmt: field.cnAgeLmt || "",
    cnUnits: field.cnUnits || "",
    rActiveYN: field.rActiveYN || "Y",
    transferYN: field.transferYN || "N",
    rNotes: field.rNotes || "",
    isEditing: field.isEditing || false,
  }));

  // Create typed append/update functions
  const typedAppendMultiple = (value: LCompMultipleDto) => {
    appendMultiple(value as any);
  };

  const typedUpdateMultiple = (index: number, value: LCompMultipleDto) => {
    updateMultiple(index, value as any);
  };

  const typedAppendReference = (value: LCompNormalDto) => {
    appendReference(value as any);
  };

  const typedUpdateReference = (index: number, value: LCompNormalDto) => {
    updateReference(index, value as any);
  };

  // Watch lCentID to show/hide appropriate sections
  const watchedLCentID = watch("lCentID");
  const watchedCompUnit = watch("compUnit");

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        lCompMultipleDto: initialData.lCompMultipleDto || [],
        lCompNormalDto: initialData.lCompNormalDto || [],
        lCompTemplateDto: initialData.lCompTemplateDto || null,
      });
      setTemplateData(initialData.lCompTemplateDto || null);
    } else {
      reset({ ...defaultValues, invID });
      setTemplateData(null);
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
      compoID: data.compoID || 0,
      compoCode: data.compoCode || "",
      compoName: data.compoName || "",
      compoTitle: data.compoTitle || "",
      invID: invID,
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
      cNHSCode: data.cNHSCode || "",
      cNHSEnglishName: data.cNHSEnglishName || "",
      cNHSGreekName: data.cNHSGreekName || "",
      cShortName: data.cShortName || "",
      rActiveYN: data.rActiveYN || "Y",
      transferYN: data.transferYN || "N",
      rNotes: data.rNotes || "",
      compoMethod: data.compoMethod || "",
      compoSample: data.compoSample || "",
      lCompMultipleDto: (watchedLCentID === LCENT_ID.MULTIPLE_SELECTION ? typedMultipleFields : []) as LCompMultipleDto[],
      lCompNormalDto: (watchedLCentID === LCENT_ID.REFERENCE_VALUES ? typedReferenceFields : []) as LCompNormalDto[],
      lCompTemplateDto: (watchedLCentID === LCENT_ID.TEMPLATE_VALUES ? templateData : undefined) as LCompTemplateDto,
    };
    onSave(componentData);
  };

  const isFormValid = () => {
    if (!isValid) return false;
    if (watchedLCentID === LCENT_ID.MULTIPLE_SELECTION && multipleFields.length === 0) {
      return false;
    }
    if (watchedLCentID === LCENT_ID.REFERENCE_VALUES && referenceFields.length === 0) {
      return false;
    }
    if (watchedLCentID === LCENT_ID.TEMPLATE_VALUES) {
      return !!(templateData && templateData.tGroupID && templateData.tGroupID > 0 && templateData.cTText);
    }
    return true;
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
          <SmartButton text={initialData ? "Update" : "Add"} onClick={handleSubmit(onSubmit)} variant="contained" color="primary" disabled={!isFormValid()} />
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
              <Grid size={{ sm: 12, md: 4 }}>
                <FormField name="compoCode" control={control} label="Component Code" type="text" required size="small" fullWidth />
              </Grid>
              <Grid size={{ sm: 12, md: 8 }}>
                <FormField name="compoName" control={control} label="Component Name" type="text" required size="small" fullWidth />
              </Grid>
              <Grid size={{ sm: 12, md: 4 }}>
                <FormField name="cShortName" control={control} label="Short Name" type="text" size="small" fullWidth />
              </Grid>
              <Grid size={{ sm: 12, md: 8 }}>
                <FormField name="compoTitle" control={control} label="Component Title" type="text" size="small" fullWidth />
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
              <Grid size={{ sm: 12, md: 4 }}>
                <FormField
                  name="mGrpCode"
                  control={control}
                  label="Main Group"
                  type="select"
                  required
                  size="small"
                  options={mainGroup || []}
                  fullWidth
                  onChange={(value: any) => {
                    const selectedItem = mainGroup?.find((type) => type.value === value.value);
                    if (selectedItem) {
                      setValue("stitID", selectedItem.id);
                      setValue("stitName", selectedItem.label);
                    }
                  }}
                />
              </Grid>
              <Grid size={{ sm: 12, md: 4 }}>
                <FormField
                  name="stitCode"
                  control={control}
                  label="Subtitle"
                  type="select"
                  required
                  size="small"
                  options={subTitle || []}
                  fullWidth
                  onChange={(value: any) => {
                    const selectedItem = subTitle?.find((type) => type.value === value.value);
                    if (selectedItem) {
                      setValue("stitID", selectedItem.id);
                      setValue("stitName", selectedItem.label);
                    }
                  }}
                />
              </Grid>
              <Grid size={{ sm: 12, md: 4 }}>
                <FormField name="compUnit" control={control} label="Unit" type="select" required size="small" options={componentUnit || []} fullWidth />
              </Grid>
              <Grid size={{ sm: 12, md: 6 }}>
                <FormField name="compoMethod" control={control} label="Method" type="textarea" size="small" fullWidth rows={2} />
              </Grid>
              <Grid size={{ sm: 12, md: 6 }}>
                <FormField name="compoSample" control={control} label="Sample" type="textarea" size="small" fullWidth rows={2} />
              </Grid>
              <Grid size={{ sm: 12, md: 12 }}>
                <FormField name="compInterpret" control={control} label="Interpretation" type="textarea" size="small" fullWidth rows={2} />
              </Grid>
              <Grid size={{ sm: 12, md: 6 }}>
                <FormField name="deltaValPercent" control={control} label="Delta Value (%)" type="number" size="small" fullWidth />
              </Grid>
              <Grid size={{ sm: 12, md: 4 }}>
                <FormField name="compDetailYN" control={control} label="Detail Required" type="switch" size="small" />
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ sm: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              Entry Type Settings
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
                  onChange={(value: any) => {
                    const selectedType = entryTypes.find((type) => Number(type.value) === Number(value.value));
                    if (selectedType) {
                      setValue("lCentName", selectedType.label);
                      setValue("lCentType", selectedType.type);
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Multiple Values Section - when lCentID === 5 */}
          {watchedLCentID === LCENT_ID.MULTIPLE_SELECTION && (
            <MultipleSelectionEntryType
              invID={invID}
              compoID={watch("compoID") || 0}
              fields={typedMultipleFields}
              append={typedAppendMultiple}
              update={typedUpdateMultiple}
              remove={removeMultiple}
            />
          )}

          {/* Reference Values Section - when lCentID === 6*/}
          {watchedLCentID === LCENT_ID.REFERENCE_VALUES && (
            <ReferenceValueEntryType
              compoID={watch("compoID") || 0}
              fields={typedReferenceFields}
              append={typedAppendReference}
              update={typedUpdateReference}
              remove={removeReference}
              defaultUnit={watchedCompUnit || ""}
            />
          )}

          {/* Template Values Section - when lCentID === 7 */}
          {watchedLCentID === LCENT_ID.TEMPLATE_VALUES && (
            <TemplateValueEntryType invID={invID} compoID={watch("compoID") || 0} templateData={templateData} onUpdate={setTemplateData} />
          )}

          {/* Notes */}
          <Grid size={{ sm: 12 }}>
            <Divider sx={{ mb: 2 }} />
            <FormField name="rNotes" control={control} label="Notes" type="textarea" size="small" fullWidth rows={3} />
          </Grid>
        </Grid>
      </Box>
    </GenericDialog>
  );
};

export default ComponentForm;
