import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  Paper,
  Divider,
  Chip,
  Stack,
  IconButton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  MenuItem,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  Button,
} from "@mui/material";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Save as SaveIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { ChargeWithAllDetailsDto, ChargeCodeGenerationDto, BChargePackDto } from "@/interfaces/Billing/ChargeDto";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { useScheduleOfCharges } from "../hooks/useScheduleOfCharges";

// Schema definition
const chargeSchema = z.object({
  chargeID: z.number().default(0),
  chargeCode: z.string().min(1, "Charge code is required"),
  chargeDesc: z.string().min(1, "Charge description is required"),
  chargesHDesc: z.string().optional(),
  chargeDescLang: z.string().optional(),
  cShortName: z.string().optional(),
  bChID: z.number().optional(),
  chargeType: z.string().min(1, "Charge type is required"),
  chargeTo: z.string().min(1, "Charge to is required"),
  chargeStatus: z.string().min(1, "Charge status is required"),
  chargeBreakYN: z.enum(["Y", "N"]).default("N"),
  regServiceYN: z.enum(["Y", "N"]).optional(),
  regDefaultServiceYN: z.enum(["Y", "N"]).optional(),
  isBedServiceYN: z.enum(["Y", "N"]).optional(),
  doctorShareYN: z.enum(["Y", "N"]).default("N"),
  cNhsCode: z.string().optional(),
  cNhsEnglishName: z.string().optional(),
  chargeCost: z.number().min(0).optional(),
  serviceGroupID: z.number().optional(),

  // Related entities
  ChargeDetails: z
    .array(
      z.object({
        chDetID: z.number().default(0),
        chargeID: z.number().default(0),
        pTypeID: z.number().min(1, "Patient type is required"),
        wCatID: z.number().min(1, "Ward category is required"),
        DcValue: z.number().min(0).optional(),
        hcValue: z.number().min(0).optional(),
        chValue: z.number().min(0, "Charge value is required"),
        chargeStatus: z.string().min(1, "Status is required"),
        ChargePacks: z
          .array(
            z.object({
              chPackID: z.number().default(0),
              chargeID: z.number().default(0),
              chDetID: z.number().optional(),
              chargeRevise: z.string().min(1, "Revision is required"),
              chargeStatus: z.string().min(1, "Status is required"),
              dcValue: z.number().min(0).optional(),
              hcValue: z.number().min(0).optional(),
              chValue: z.number().min(0, "Value is required"),
              effectiveFromDate: z.date().optional(),
              effectiveToDate: z.date().optional(),
            })
          )
          .default([]),
      })
    )
    .default([]),

  DoctorShares: z
    .array(
      z.object({
        docShareID: z.number().default(0),
        chargeID: z.number().default(0),
        conID: z.number().min(1, "Doctor is required"),
        doctorShare: z.number().min(0).max(100, "Share cannot exceed 100%"),
        hospShare: z.number().min(0).max(100, "Share cannot exceed 100%"),
      })
    )
    .default([]),

  ChargeAliases: z
    .array(
      z.object({
        chAliasID: z.number().default(0),
        chargeID: z.number().default(0),
        pTypeID: z.number().min(1, "Patient type is required"),
        chargeDesc: z.string().min(1, "Description is required"),
        chargeDescLang: z.string().min(1, "Language description is required"),
      })
    )
    .default([]),

  ChargeFaculties: z
    .array(
      z.object({
        chFacID: z.number().default(0),
        chargeID: z.number().default(0),
        aSubID: z.number().min(1, "Academic subject is required"),
      })
    )
    .default([]),

  ChargePacks: z
    .array(
      z.object({
        chPackID: z.number().default(0),
        chargeID: z.number().default(0),
        chDetID: z.number().optional(),
        chargeRevise: z.string().min(1, "Revision is required"),
        chargeStatus: z.string().min(1, "Status is required"),
        dcValue: z.number().min(0).optional(),
        hcValue: z.number().min(0).optional(),
        chValue: z.number().min(0, "Value is required"),
        effectiveFromDate: z.date().optional(),
        effectiveToDate: z.date().optional(),
      })
    )
    .default([]),
});

type ChargeFormData = z.infer<typeof chargeSchema>;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`charge-tabpanel-${index}`} aria-labelledby={`charge-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

// Define interface for grid data
interface PricingGridItem {
  id: string;
  picId: number;
  picName: string;
  selected: boolean;
  wardCategories: {
    [key: string]: {
      drAmt: number;
      hospAmt: number;
      totAmt: number;
    };
  };
}

interface ChargeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (charge: ChargeWithAllDetailsDto) => Promise<void>;
  charge: ChargeWithAllDetailsDto | null;
}

const ChargeFormDialog: React.FC<ChargeFormDialogProps> = ({ open, onClose, onSubmit, charge }) => {
  const [tabValue, setTabValue] = useState(0);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [doctorSharesExpanded, setDoctorSharesExpanded] = useState(false);
  const [aliasesExpanded, setAliasesExpanded] = useState(false);
  const [facultiesExpanded, setFacultiesExpanded] = useState(false);
  const [packsExpanded, setPacksExpanded] = useState(false);

  // Pricing grid state
  const [gridTab, setGridTab] = useState(0); // 0 for Service Charges, 1 for Service Alias
  const [picFilter, setPicFilter] = useState<string>("All");
  const [wardCategoryFilter, setWardCategoryFilter] = useState<string>("All");
  const [isPercentage, setIsPercentage] = useState<boolean>(false);
  const [amountValue, setAmountValue] = useState<number>(0);
  const [priceChangeType, setPriceChangeType] = useState<string>("None");
  const [displayAmountType, setDisplayAmountType] = useState<string>("Both");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pricingGridData, setPricingGridData] = useState<PricingGridItem[]>([]);

  const isEditMode = !!charge && charge.chargeID > 0;
  const { generateChargeCode } = useScheduleOfCharges();

  // Load dropdown values
  const {
    serviceType = [],
    serviceGroup = [],
    pic = [],
    bedCategory = [],
    attendingPhy = [],
    subModules = [],
  } = useDropdownValues(["serviceType", "serviceGroup", "pic", "bedCategory", "attendingPhy", "subModules"]);

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm<ChargeFormData>({
    resolver: zodResolver(chargeSchema),
    mode: "onChange",
    defaultValues: {
      chargeID: 0,
      chargeCode: "",
      chargeDesc: "",
      chargesHDesc: "",
      chargeDescLang: "",
      cShortName: "",
      bChID: 0,
      chargeType: "",
      chargeTo: "",
      chargeStatus: "AC",
      chargeBreakYN: "N",
      regServiceYN: "N",
      regDefaultServiceYN: "N",
      isBedServiceYN: "N",
      doctorShareYN: "N",
      cNhsCode: "",
      cNhsEnglishName: "",
      chargeCost: 0,
      serviceGroupID: 0,
      ChargeDetails: [],
      DoctorShares: [],
      ChargeAliases: [],
      ChargeFaculties: [],
      ChargePacks: [],
    },
  });

  // Field arrays for dynamic sections
  const chargeDetailsArray = useFieldArray({
    control,
    name: "ChargeDetails",
  });

  const doctorSharesArray = useFieldArray({
    control,
    name: "DoctorShares",
  });

  const aliasesArray = useFieldArray({
    control,
    name: "ChargeAliases",
  });

  const facultiesArray = useFieldArray({
    control,
    name: "ChargeFaculties",
  });

  const packsArray = useFieldArray({
    control,
    name: "ChargePacks",
  });

  // Watch values
  const watchedBChID = watch("bChID");
  const watchedChargeTo = watch("chargeTo");
  const watchedServiceGroupID = watch("serviceGroupID");
  const watchedDoctorShareYN = watch("doctorShareYN");

  // Define ward categories
  const wardCategories = useMemo(
    () => [
      { id: 1, name: "OPD", color: "#4caf50" },
      { id: 2, name: "GENERAL WARD", color: "#f44336" },
      { id: 3, name: "SEMI SPECIAL", color: "#00bcd4" },
      { id: 4, name: "SPECIAL WARD AC", color: "#3f51b5" },
      { id: 5, name: "SPECIAL ROOM", color: "#4caf50" },
    ],
    []
  );

  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      if (charge) {
        reset({
          chargeID: charge.chargeID,
          chargeCode: charge.chargeCode,
          chargeDesc: charge.chargeDesc,
          chargesHDesc: charge.chargesHDesc || "",
          chargeDescLang: charge.chargeDescLang || "",
          cShortName: charge.cShortName || "",
          bChID: charge.bChID || 0,
          chargeType: charge.chargeType,
          chargeTo: charge.chargeTo,
          chargeStatus: charge.chargeStatus,
          chargeBreakYN: charge.chargeBreakYN,
          regServiceYN: charge.regServiceYN || "N",
          regDefaultServiceYN: charge.regDefaultServiceYN || "N",
          isBedServiceYN: charge.isBedServiceYN || "N",
          doctorShareYN: charge.doctorShareYN || "N",
          cNhsCode: charge.cNhsCode || "",
          cNhsEnglishName: charge.cNhsEnglishName || "",
          chargeCost: charge.chargeCost || 0,
          serviceGroupID: charge.serviceGroupID || 0,
          ChargeDetails: charge.ChargeDetails || [],
          DoctorShares: charge.DoctorShares || [],
          ChargeAliases: charge.ChargeAliases || [],
          ChargeFaculties: charge.ChargeFaculties || [],
          ChargePacks: charge.ChargePacks || [],
        });

        // Initialize grid data from charge details
        initializeGridData(charge.ChargeDetails);

        // Expand sections that have data
        setDetailsExpanded(charge.ChargeDetails?.length > 0);
        setDoctorSharesExpanded(charge.DoctorShares?.length > 0);
        setAliasesExpanded(charge.ChargeAliases?.length > 0);
        setFacultiesExpanded(charge.ChargeFaculties?.length > 0);
        setPacksExpanded(charge.ChargePacks?.length > 0);
      } else {
        reset();
        setTabValue(0);
        setDetailsExpanded(false);
        setDoctorSharesExpanded(false);
        setAliasesExpanded(false);
        setFacultiesExpanded(false);
        setPacksExpanded(false);
        initializeGridData([]);
      }
    }
  }, [open, charge, reset]);

  // Initialize grid data from charge details
  const initializeGridData = (chargeDetails: any[] = []) => {
    // Group charge details by patient type
    const patientGroups: Record<number, any[]> = {};

    if (chargeDetails && chargeDetails.length > 0) {
      chargeDetails.forEach((detail) => {
        if (!patientGroups[detail.pTypeID]) {
          patientGroups[detail.pTypeID] = [];
        }
        patientGroups[detail.pTypeID].push(detail);
      });
    }

    // Generate grid data from patient groups
    const gridData: PricingGridItem[] = [];

    // Use the first 5 patient types if no data
    const patientTypes = Object.keys(patientGroups).length > 0 ? Object.keys(patientGroups).map(Number) : pic.slice(0, 5).map((p) => Number(p.value));

    patientTypes.forEach((patientTypeId) => {
      const patientType = pic.find((p) => Number(p.value) === patientTypeId);
      const details = patientGroups[patientTypeId] || [];

      const wardCategoriesData: Record<string, any> = {};

      // Initialize with default values for all ward categories
      wardCategories.forEach((wc) => {
        wardCategoriesData[wc.name] = {
          drAmt: 0,
          hospAmt: 0,
          totAmt: 0,
        };
      });

      // Update with actual values from charge details
      details.forEach((detail) => {
        const wardCategory = bedCategory.find((wc) => Number(wc.value) === detail.wCatID);
        const wcName = wardCategory?.label || getWardCategoryById(detail.wCatID);

        if (wcName) {
          wardCategoriesData[wcName] = {
            drAmt: detail.DcValue || 0,
            hospAmt: detail.hcValue || 0,
            totAmt: detail.chValue || 0,
          };
        }
      });

      gridData.push({
        id: `pic-${patientTypeId}`,
        picId: patientTypeId,
        picName: patientType?.label || `Patient Type ${patientTypeId}`,
        selected: false,
        wardCategories: wardCategoriesData,
      });
    });

    setPricingGridData(gridData);
  };

  // Get ward category name by ID
  const getWardCategoryById = (id: number): string => {
    const category = wardCategories.find((wc) => wc.id === id);
    if (category) return category.name;

    const bedCat = bedCategory.find((bc) => Number(bc.value) === id);
    return (bedCat?.label as string) || `Ward Category ${id}`;
  };

  // Get ward category ID by name
  const getWardCategoryIdByName = (name: string): number => {
    const category = wardCategories.find((wc) => wc.name === name);
    if (category) return category.id;

    const bedCat = bedCategory.find((bc) => bc.label === name);
    return bedCat ? Number(bedCat.value) : 0;
  };

  // Update charge details from grid data
  const updateChargeDetailsFromGrid = () => {
    // Clear existing charge details
    chargeDetailsArray.remove();

    // Create charge details from grid data
    pricingGridData.forEach((row) => {
      Object.entries(row.wardCategories).forEach(([wcName, values]) => {
        // Skip if all values are zero
        if (values.drAmt === 0 && values.hospAmt === 0 && values.totAmt === 0) {
          return;
        }

        const wcId = getWardCategoryIdByName(wcName);

        if (wcId) {
          chargeDetailsArray.append({
            chDetID: 0,
            chargeID: 0,
            pTypeID: row.picId,
            wCatID: wcId,
            DcValue: values.drAmt,
            hcValue: values.hospAmt,
            chValue: values.totAmt,
            chargeStatus: "AC",
            ChargePacks: [],
          });
        }
      });
    });
  };

  // Toggle row selection
  const toggleRowSelection = (rowId: string) => {
    if (selectedRows.includes(rowId)) {
      setSelectedRows(selectedRows.filter((id) => id !== rowId));
    } else {
      setSelectedRows([...selectedRows, rowId]);
    }
  };

  const isRowSelected = (rowId: string) => {
    return selectedRows.includes(rowId);
  };
  const applyChanges = () => {
    if (priceChangeType === "None" || selectedRows.length === 0) {
      return;
    }

    const updatedGridData = pricingGridData.map((row) => {
      if (selectedRows.includes(row.id)) {
        const updatedCategories = { ...row.wardCategories };
        const categoriesToUpdate = wardCategoryFilter === "All" ? Object.keys(updatedCategories) : [bedCategory.find((wc) => wc.value === wardCategoryFilter)?.label as string];
        categoriesToUpdate.forEach((wcName) => {
          if (!updatedCategories[wcName]) return;
          const currentValues = updatedCategories[wcName];
          const updateDr = displayAmountType === "Both" || displayAmountType === "Dr Amt";
          const updateHosp = displayAmountType === "Both" || displayAmountType === "Hosp Amt";

          if (updateDr) {
            if (priceChangeType === "Increase") {
              currentValues.drAmt += isPercentage ? Math.round((currentValues.drAmt * amountValue) / 100) : amountValue;
            } else if (priceChangeType === "Decrease") {
              currentValues.drAmt -= isPercentage ? Math.round((currentValues.drAmt * amountValue) / 100) : amountValue;

              if (currentValues.drAmt < 0) currentValues.drAmt = 0;
            }
          }

          if (updateHosp) {
            if (priceChangeType === "Increase") {
              currentValues.hospAmt += isPercentage ? Math.round((currentValues.hospAmt * amountValue) / 100) : amountValue;
            } else if (priceChangeType === "Decrease") {
              currentValues.hospAmt -= isPercentage ? Math.round((currentValues.hospAmt * amountValue) / 100) : amountValue;

              if (currentValues.hospAmt < 0) currentValues.hospAmt = 0;
            }
          }
          currentValues.totAmt = currentValues.drAmt + currentValues.hospAmt;
        });

        return {
          ...row,
          wardCategories: updatedCategories,
        };
      }

      return row;
    });

    setPricingGridData(updatedGridData);
    updateChargeDetailsFromGrid();
  };

  const handleGenerateCode = useCallback(async () => {
    if (!watchedBChID || !watchedChargeTo) {
      return;
    }
    try {
      setIsGeneratingCode(true);

      // Find the charge type label from bChID
      const selectedOption = serviceType.find((option) => Number(option.value) === Number(watchedBChID));
      const chargeTypeLabel = selectedOption?.label || "";

      const codeData: ChargeCodeGenerationDto = {
        ChargeType: chargeTypeLabel,
        ChargeTo: watchedChargeTo,
        ServiceGroupId: watchedServiceGroupID > 0 ? watchedServiceGroupID : undefined,
      };

      const newCode = await generateChargeCode(codeData);
      setValue("chargeCode", newCode, { shouldValidate: true });
    } catch (error) {
      console.error("Error generating charge code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  }, [watchedBChID, watchedChargeTo, watchedServiceGroupID, generateChargeCode, setValue, serviceType]);

  useEffect(() => {
    if (!isEditMode && watchedBChID && watchedChargeTo) {
      handleGenerateCode();
    }
  }, [watchedBChID, watchedChargeTo, isEditMode, handleGenerateCode]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGridTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setGridTab(newValue);
  };

  const onFormSubmit = async (data: ChargeFormData) => {
    try {
      updateChargeDetailsFromGrid();
      const formattedData: ChargeWithAllDetailsDto = {
        chargeID: data.chargeID,
        chargeCode: data.chargeCode,
        chargeDesc: data.chargeDesc,
        chargesHDesc: data.chargesHDesc,
        chargeDescLang: data.chargeDescLang,
        cShortName: data.cShortName,
        chargeType: data.chargeType,
        chargeTo: data.chargeTo,
        bChID: data.bChID,
        chargeStatus: data.chargeStatus,
        chargeBreakYN: data.chargeBreakYN,
        regServiceYN: data.regServiceYN,
        regDefaultServiceYN: data.regDefaultServiceYN,
        isBedServiceYN: data.isBedServiceYN,
        doctorShareYN: data.doctorShareYN,
        cNhsCode: data.cNhsCode,
        cNhsEnglishName: data.cNhsEnglishName,
        chargeCost: data.chargeCost,
        serviceGroupID: data.serviceGroupID,
        ChargeDetails: data.ChargeDetails.map((detail) => ({
          chDetID: detail.chDetID || 0,
          chargeID: data.chargeID,
          pTypeID: detail.pTypeID,
          wCatID: detail.wCatID,
          DcValue: detail.DcValue,
          hcValue: detail.hcValue,
          chValue: detail.chValue,
          chargeStatus: detail.chargeStatus || "AC",
          ChargePacks: (detail.ChargePacks || []).map((pack) => ({
            chPackID: pack.chPackID ?? 0,
            chargeID: pack.chargeID ?? data.chargeID,
            chDetID: pack.chDetID ?? detail.chDetID ?? 0,
            chargeRevise: pack.chargeRevise ?? "",
            chargeStatus: pack.chargeStatus ?? "AC",
            dcValue: pack.dcValue ?? 0,
            hcValue: pack.hcValue ?? 0,
            chValue: pack.chValue ?? 0,
            effectiveFromDate: pack.effectiveFromDate,
            effectiveToDate: pack.effectiveToDate,
          })),
        })),
        DoctorShares: data.DoctorShares.map((share) => ({
          docShareID: share.docShareID || 0,
          chargeID: data.chargeID,
          conID: share.conID,
          doctorShare: share.doctorShare,
          hospShare: share.hospShare,
        })),
        ChargeAliases: data.ChargeAliases.map((alias) => ({
          chAliasID: alias.chAliasID || 0,
          chargeID: data.chargeID,
          pTypeID: alias.pTypeID,
          chargeDesc: alias.chargeDesc,
          chargeDescLang: alias.chargeDescLang,
        })),
        ChargeFaculties: data.ChargeFaculties.map((faculty) => ({
          chFacID: faculty.chFacID || 0,
          chargeID: data.chargeID,
          aSubID: faculty.aSubID,
        })),
        ChargePacks: data.ChargePacks.map((pack) => ({
          chPackID: pack.chPackID || 0,
          chargeID: data.chargeID,
          chDetID: pack.chDetID,
          chargeRevise: pack.chargeRevise,
          chargeStatus: pack.chargeStatus || "AC",
          dcValue: pack.dcValue,
          hcValue: pack.hcValue,
          chValue: pack.chValue,
          effectiveFromDate: pack.effectiveFromDate,
          effectiveToDate: pack.effectiveToDate,
        })),
      };

      await onSubmit(formattedData);
    } catch (error) {
      console.error("Error submitting charge:", error);
    }
  };

  const handleClear = () => {
    if (isEditMode && charge) {
      reset(charge);
      initializeGridData(charge.ChargeDetails);
    } else {
      reset();
      initializeGridData([]);
    }
  };

  // Add new doctor share
  const addDoctorShare = () => {
    doctorSharesArray.append({
      docShareID: 0,
      chargeID: 0,
      conID: 0,
      doctorShare: 0,
      hospShare: 0,
    });
    setDoctorSharesExpanded(true);
  };

  const addAlias = () => {
    aliasesArray.append({
      chAliasID: 0,
      chargeID: 0,
      pTypeID: 0,
      chargeDesc: "",
      chargeDescLang: "",
    });
    setAliasesExpanded(true);
  };

  const addFaculty = () => {
    facultiesArray.append({
      chFacID: 0,
      chargeID: 0,
      aSubID: 0,
    });
    setFacultiesExpanded(true);
  };

  const addPack = () => {
    packsArray.append({
      chPackID: 0,
      chargeID: 0,
      chargeRevise: "",
      chargeStatus: "AC",
      dcValue: 0,
      hcValue: 0,
      chValue: 0,
    });
    setPacksExpanded(true);
  };

  const handleBChIDChange = useCallback(
    (value: any) => {
      const selectedOption = serviceType.find((option) => Number(option.value) === Number(value));
      if (selectedOption) {
        setValue("bChID", Number(value), { shouldValidate: true });
        setValue("chargeType", selectedOption.label, { shouldValidate: true });
      }
    },
    [serviceType, setValue]
  );

  // Prepare grid columns for pricing grid
  const pricingGridColumns = useMemo(() => {
    const columns: Column<any>[] = [
      {
        key: "select",
        header: "Select",
        visible: true,
        width: 70,
        render: (row) => <input type="checkbox" checked={isRowSelected(row.id)} onChange={() => toggleRowSelection(row.id)} />,
      },
      {
        key: "picName",
        header: "PIC Name",
        visible: true,
        width: 180,
        render: (row) => (
          <Typography variant="body2" fontWeight="medium">
            {row.picName}
          </Typography>
        ),
      },
    ];

    // Add columns for each ward category
    wardCategories.forEach((category) => {
      // Dr Amt column
      columns.push({
        key: `${category.name}-drAmt`,
        header: "Dr Amt",
        visible: true,
        width: 100,
        align: "center",
        headerStyle: {
          backgroundColor: category.color,
          color: "white",
          textAlign: "center",
          borderRight: "0px solid white",
        },
        cellStyle: { padding: "4px", textAlign: "center" },
        render: (row) => (
          <input
            type="number"
            min="0"
            value={row.wardCategories[category.name]?.drAmt || 0}
            onChange={(e) => {
              const value = Number(e.target.value);
              const updatedData = [...pricingGridData];
              const rowIndex = updatedData.findIndex((r) => r.id === row.id);

              if (rowIndex !== -1) {
                if (!updatedData[rowIndex].wardCategories[category.name]) {
                  updatedData[rowIndex].wardCategories[category.name] = { drAmt: 0, hospAmt: 0, totAmt: 0 };
                }

                updatedData[rowIndex].wardCategories[category.name].drAmt = value;
                updatedData[rowIndex].wardCategories[category.name].totAmt = value + (updatedData[rowIndex].wardCategories[category.name].hospAmt || 0);

                setPricingGridData(updatedData);
                updateChargeDetailsFromGrid();
              }
            }}
            style={{
              width: "70px",
              padding: "4px",
              textAlign: "right",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        ),
      });

      // Hosp Amt column
      columns.push({
        key: `${category.name}-hospAmt`,
        header: "Hosp Amt.",
        visible: true,
        width: 100,
        align: "center",
        headerStyle: {
          backgroundColor: category.color,
          color: "white",
          textAlign: "center",
          borderRight: "0px solid white",
        },
        cellStyle: { padding: "4px", textAlign: "center" },
        render: (row) => (
          <input
            type="number"
            min="0"
            value={row.wardCategories[category.name]?.hospAmt || 0}
            onChange={(e) => {
              const value = Number(e.target.value);
              const updatedData = [...pricingGridData];
              const rowIndex = updatedData.findIndex((r) => r.id === row.id);

              if (rowIndex !== -1) {
                if (!updatedData[rowIndex].wardCategories[category.name]) {
                  updatedData[rowIndex].wardCategories[category.name] = { drAmt: 0, hospAmt: 0, totAmt: 0 };
                }

                updatedData[rowIndex].wardCategories[category.name].hospAmt = value;
                updatedData[rowIndex].wardCategories[category.name].totAmt = (updatedData[rowIndex].wardCategories[category.name].drAmt || 0) + value;

                setPricingGridData(updatedData);
                updateChargeDetailsFromGrid();
              }
            }}
            style={{
              width: "70px",
              padding: "4px",
              textAlign: "right",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        ),
      });

      // Tot Amt column
      columns.push({
        key: `${category.name}-totAmt`,
        header: "Tot Amt",
        visible: true,
        width: 100,
        align: "center",
        headerStyle: {
          backgroundColor: category.color,
          color: "white",
          textAlign: "center",
          borderRight: "1px solid white",
        },
        cellStyle: { padding: "4px", textAlign: "center", borderRight: "1px solid #e0e0e0" },
        render: (row) => (
          <input
            type="number"
            min="0"
            value={row.wardCategories[category.name]?.totAmt || 0}
            onChange={(e) => {
              const value = Number(e.target.value);
              const updatedData = [...pricingGridData];
              const rowIndex = updatedData.findIndex((r) => r.id === row.id);

              if (rowIndex !== -1) {
                if (!updatedData[rowIndex].wardCategories[category.name]) {
                  updatedData[rowIndex].wardCategories[category.name] = { drAmt: 0, hospAmt: 0, totAmt: 0 };
                }

                updatedData[rowIndex].wardCategories[category.name].totAmt = value;

                setPricingGridData(updatedData);
                updateChargeDetailsFromGrid();
              }
            }}
            style={{
              width: "70px",
              padding: "4px",
              textAlign: "right",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontWeight: "bold",
              backgroundColor: "#e8f0fe",
            }}
          />
        ),
      });
    });

    return columns;
  }, [pricingGridData, selectedRows, wardCategories]);

  // Filter grid data based on selected filters
  const filteredPricingData = useMemo(() => {
    return pricingGridData.filter((row) => {
      if (picFilter !== "All" && row.picId !== parseInt(picFilter)) {
        return false;
      }
      return true;
    });
  }, [pricingGridData, picFilter]);

  const dialogActions = (
    <>
      <CustomButton variant="outlined" text={isEditMode ? "Reset" : "Clear"} icon={ClearIcon} onClick={handleClear} disabled={isSubmitting || !isDirty} color="inherit" />
      <CustomButton variant="outlined" text="Cancel" onClick={onClose} disabled={isSubmitting} />
      <SmartButton
        variant="contained"
        text={isEditMode ? "Update Charge" : "Create Charge"}
        icon={SaveIcon}
        onAsyncClick={handleSubmit(onFormSubmit)}
        asynchronous
        disabled={!isValid || !isDirty}
        color="primary"
        loadingText={isEditMode ? "Updating..." : "Creating..."}
        successText={isEditMode ? "Updated!" : "Created!"}
      />
    </>
  );

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={isEditMode ? "Edit Charge" : "New Charge"}
      maxWidth="xl"
      fullWidth
      disableBackdropClick={isSubmitting}
      disableEscapeKeyDown={isSubmitting}
      actions={dialogActions}
    >
      <Box sx={{ width: "100%" }}>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Basic Charge Information
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="chargeCode"
                  control={control}
                  type="text"
                  label="Charge Code"
                  required
                  disabled={isEditMode}
                  size="small"
                  helperText={isEditMode ? "Code cannot be changed" : isGeneratingCode ? "Generating..." : "Auto-generated based on type"}
                  adornment={
                    !isEditMode && (
                      <CustomButton size="small" variant="outlined" text="Generate" onClick={handleGenerateCode} disabled={!watchedBChID || !watchedChargeTo || isGeneratingCode} />
                    )
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="bChID" control={control} type="select" onChange={handleBChIDChange} label="Charge Type" required size="small" options={serviceType} />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="chargeTo"
                  control={control}
                  type="select"
                  label="Charge To"
                  required
                  size="small"
                  options={[
                    { value: "PAT", label: "Patient" },
                    { value: "INS", label: "Insurance" },
                    { value: "GOVT", label: "Government" },
                    { value: "CORP", label: "Corporate" },
                  ]}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="chargeDesc" control={control} type="text" label="Charge Name" size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="cShortName" control={control} type="text" label="Short Name" size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="serviceGroupID" control={control} type="select" label="Service Group" size="small" options={serviceGroup} />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="chargeCost" control={control} type="number" label="Charge Cost" size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="cNhsCode" control={control} type="text" label="Resource Code" size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="cNhsEnglishName" control={control} type="text" label="Resource Name" size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="scheduleDate" control={control} type="datepicker" label="Schedule Date" size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="chargesHDesc" control={control} type="textarea" label="Charge Description" size="small" />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Configuration Options
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <EnhancedFormField name="doctorShareYN" control={control} type="switch" label="Enable Doctor Share" size="small" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <EnhancedFormField name="regServiceYN" control={control} type="switch" label="Registration Service" size="small" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <EnhancedFormField name="isBedServiceYN" control={control} type="switch" label="Bed Service" size="small" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <EnhancedFormField name="chargeBreakYN" control={control} type="switch" label="Charge Break" size="small" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <EnhancedFormField name="chargeStatus" control={control} type="switch" label="Charge Status " size="small" />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          {/* Pricing Details with CustomGrid */}
          <Accordion expanded={detailsExpanded} onChange={() => setDetailsExpanded(!detailsExpanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1} width="100%">
                <Typography variant="subtitle1">Pricing Details</Typography>
                <Chip label={`${chargeDetailsArray.fields.length} entries`} size="small" color="primary" variant="outlined" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                {/* Filter Controls */}
                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Typography variant="subtitle2">PIC</Typography>
                    <TextField select fullWidth size="small" value={picFilter} onChange={(e) => setPicFilter(e.target.value)}>
                      <MenuItem value="All">All</MenuItem>
                      {pic.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }}>
                    <Typography variant="subtitle2">Ward Category</Typography>
                    <TextField select fullWidth size="small" value={wardCategoryFilter} onChange={(e) => setWardCategoryFilter(e.target.value)}>
                      <MenuItem value="All">All</MenuItem>
                      {bedCategory.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box display="flex" alignItems="center">
                      <FormControlLabel
                        control={<Switch checked={isPercentage} onChange={(e) => setIsPercentage(e.target.checked)} color="primary" />}
                        label="Percentage"
                        sx={{ mr: 2 }}
                      />
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {isPercentage ? "Percentage" : "Amount"}
                      </Typography>
                      <TextField
                        type="number"
                        size="small"
                        value={amountValue}
                        onChange={(e) => setAmountValue(Number(e.target.value))}
                        InputProps={{
                          inputProps: { min: 0 },
                        }}
                        sx={{ width: 150, mr: 2 }}
                      />
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl component="fieldset">
                      <RadioGroup row value={priceChangeType} onChange={(e) => setPriceChangeType(e.target.value)}>
                        <FormControlLabel value="None" control={<Radio size="small" />} label="None" />
                        <FormControlLabel value="Increase" control={<Radio size="small" />} label="Increase" />
                        <FormControlLabel value="Decrease" control={<Radio size="small" />} label="Decrease" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl component="fieldset">
                      <RadioGroup row value={displayAmountType} onChange={(e) => setDisplayAmountType(e.target.value)}>
                        <FormControlLabel value="Both" control={<Radio size="small" />} label="Both" />
                        <FormControlLabel value="Dr Amt" control={<Radio size="small" />} label="Dr Amt" />
                        <FormControlLabel value="Hosp Amt" control={<Radio size="small" />} label="Hosp Amt" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 2 }}>
                    <Box display="flex" justifyContent="flex-end">
                      <Button variant="contained" startIcon={<VisibilityIcon />} size="small" color="primary" sx={{ mr: 1 }}>
                        View
                      </Button>
                      <Button variant="contained" startIcon={<CheckIcon />} size="small" color="success" onClick={applyChanges}>
                        Apply
                      </Button>
                    </Box>
                  </Grid>
                </Grid>

                {/* Pricing Grid */}
                {gridTab === 0 && (
                  <Box sx={{ maxHeight: "500px", overflowX: "auto" }}>
                    <CustomGrid
                      columns={pricingGridColumns}
                      data={filteredPricingData}
                      maxHeight="500px"
                      emptyStateMessage="No pricing data available"
                      density="small"
                      gridStyle={{
                        border: "1px solid #e0e0e0",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    />
                  </Box>
                )}

                {/* Service Alias Tab Content */}
                {gridTab === 1 && (
                  <Box p={2}>
                    <Typography variant="body1">Service Alias content goes here</Typography>
                  </Box>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
                  Note: You can select multiple rows and apply changes to Doctor and Hospital amounts in bulk. When you change Doctor Amount or Hospital Amount, the Total Amount
                  will be calculated automatically.
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Doctor Shares */}
          {watchedDoctorShareYN === "Y" && (
            <Accordion expanded={doctorSharesExpanded} onChange={() => setDoctorSharesExpanded(!doctorSharesExpanded)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1} width="100%">
                  <Typography variant="subtitle1">Doctor Revenue Sharing</Typography>
                  <Chip label={`${doctorSharesArray.fields.length} doctors`} size="small" color="success" variant="outlined" />
                  <Box sx={{ ml: "auto" }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        addDoctorShare();
                      }}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {doctorSharesArray.fields.map((field, index) => (
                    <Paper key={field.id} sx={{ p: 2, backgroundColor: "grey.50" }}>
                      <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                        <Typography variant="subtitle2">Doctor Share #{index + 1}</Typography>
                        <IconButton size="small" color="error" onClick={() => doctorSharesArray.remove(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <EnhancedFormField name={`DoctorShares.${index}.conID`} control={control} type="select" label="Doctor" size="small" options={attendingPhy} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <EnhancedFormField name={`DoctorShares.${index}.doctorShare`} control={control} type="number" label="Doctor Share (%)" size="small" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <EnhancedFormField name={`DoctorShares.${index}.hospShare`} control={control} type="number" label="Hospital Share (%)" size="small" />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                  {doctorSharesArray.fields.length === 0 && <Alert severity="info">No doctor shares configured. Click the + button to add revenue sharing with doctors.</Alert>}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Charge Aliases */}
          <Accordion expanded={aliasesExpanded} onChange={() => setAliasesExpanded(!aliasesExpanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1} width="100%">
                <Typography variant="subtitle1">Charge Aliases</Typography>
                <Chip label={`${aliasesArray.fields.length} aliases`} size="small" color="info" variant="outlined" />
                <Box sx={{ ml: "auto" }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      addAlias();
                    }}
                    color="primary"
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {aliasesArray.fields.map((field, index) => (
                  <Paper key={field.id} sx={{ p: 2, backgroundColor: "grey.50" }}>
                    <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                      <Typography variant="subtitle2">Alias #{index + 1}</Typography>
                      <IconButton size="small" color="error" onClick={() => aliasesArray.remove(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <EnhancedFormField name={`ChargeAliases.${index}.pTypeID`} control={control} type="select" label="Patient Type" size="small" options={pic} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <EnhancedFormField
                          name={`ChargeAliases.${index}.chargeDesc`}
                          control={control}
                          type="text"
                          label="Alias Description"
                          size="small"
                          helperText="Alternative description for this patient type"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <EnhancedFormField
                          name={`ChargeAliases.${index}.chargeDescLang`}
                          control={control}
                          type="text"
                          label="Local Language Description"
                          size="small"
                          helperText="Description in local language"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                {aliasesArray.fields.length === 0 && (
                  <Alert severity="info">No charge aliases configured. Click the + button to add alternative descriptions for different patient types or languages.</Alert>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Faculties Section */}
          <Accordion expanded={facultiesExpanded} onChange={() => setFacultiesExpanded(!facultiesExpanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1} width="100%">
                <Typography variant="subtitle1">Associated Faculties</Typography>
                <Chip label={`${facultiesArray.fields.length} faculties`} size="small" color="secondary" variant="outlined" />
                <Box sx={{ ml: "auto" }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      addFaculty();
                    }}
                    color="primary"
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {facultiesArray.fields.map((field, index) => (
                  <Paper key={field.id} sx={{ p: 2, backgroundColor: "grey.50" }}>
                    <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                      <Typography variant="subtitle2">Faculty #{index + 1}</Typography>
                      <IconButton size="small" color="error" onClick={() => facultiesArray.remove(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 12 }}>
                        <EnhancedFormField
                          name={`ChargeFaculties.${index}.aSubID`}
                          control={control}
                          type="select"
                          label="Academic Subject/Faculty"
                          required
                          size="small"
                          options={subModules}
                          helperText="Select the academic subject or faculty this charge is associated with"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                {facultiesArray.fields.length === 0 && (
                  <Alert severity="info">No faculties associated. Click the + button to associate this charge with academic subjects or faculties.</Alert>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={packsExpanded} onChange={() => setPacksExpanded(!packsExpanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1} width="100%">
                <Typography variant="subtitle1">Charge Packs</Typography>
                <Chip label={`${packsArray.fields.length} packs`} size="small" color="warning" variant="outlined" />
                <Box sx={{ ml: "auto" }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      addPack();
                    }}
                    color="primary"
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {packsArray.fields.map((field, index) => (
                  <Paper key={field.id} sx={{ p: 2, backgroundColor: "grey.50" }}>
                    <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                      <Typography variant="subtitle2">Pack #{index + 1}</Typography>
                      <IconButton size="small" color="error" onClick={() => packsArray.remove(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <EnhancedFormField
                          name={`ChargePacks.${index}.chargeRevise`}
                          control={control}
                          type="text"
                          label="Revision"
                          size="small"
                          helperText="Pack revision identifier"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <EnhancedFormField name={`ChargePacks.${index}.chValue`} control={control} type="number" label="Pack Value" size="small" />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <EnhancedFormField name={`ChargePacks.${index}.effectiveFromDate`} control={control} type="datepicker" label="Effective From" size="small" />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <EnhancedFormField name={`ChargePacks.${index}.effectiveToDate`} control={control} type="datepicker" label="Effective To" size="small" />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <EnhancedFormField name={`ChargePacks.${index}.dcValue`} control={control} type="number" label="DC Value" size="small" />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <EnhancedFormField name={`ChargePacks.${index}.hcValue`} control={control} type="number" label="HC Value" size="small" />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <EnhancedFormField
                          name={`ChargePacks.${index}.chargeStatus`}
                          control={control}
                          type="select"
                          label="Status"
                          size="small"
                          options={[
                            { value: "AC", label: "Active" },
                            { value: "IN", label: "Inactive" },
                          ]}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                {packsArray.fields.length === 0 && (
                  <Alert severity="info">No charge packs configured. Click the + button to add versioned charge packages with effective dates.</Alert>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </form>
      </Box>
    </GenericDialog>
  );
};

export default ChargeFormDialog;
