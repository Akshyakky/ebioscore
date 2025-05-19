import React, { useCallback, useEffect, useState } from "react";
import { Paper, Typography, Grid } from "@mui/material";
import { LInvMastDto } from "@/interfaces/Laboratory/LInvMastDto";
import FormField from "@/components/FormField/FormField";

import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { debounce } from "lodash";
import { SelectChangeEvent } from "@mui/material";
import { investigationlistService } from "@/services/Laboratory/LaboratoryService";

interface InvestigationListDetailsProps {
  onUpdate: (data: LInvMastDto) => void;
  investigationData?: LInvMastDto | null;
  shouldReset?: boolean;
  onSelect?: (data: LInvMastDto) => void;
  onCodeSelect?: (selectedSuggestion: string) => void;
  isSubmitted?: boolean;
}

const InvestigationListDetails: React.FC<InvestigationListDetailsProps> = ({ onUpdate, investigationData, shouldReset, onCodeSelect, isSubmitted }) => {
  const dropdownValues = useDropdownValues(["investigationType", "sampleType", "service"]);
  const [{ compID, compCode, compName, userID, userName }, setCompData] = useState({ compID: 1, compCode: "KVG", compName: "KVG Medical College", userID: 0, userName: "Akshay" });
  const serverDate = useServerDate();

  const [formState, setFormState] = useState<LInvMastDto>({
    invID: 0,
    invName: "",
    invTypeCode: "",
    invReportYN: "N",
    invSampleYN: "N",
    invTitle: "",
    invSTitle: "",
    invPrintOrder: 0,
    deptID: 0,
    deptName: "",
    bchID: 0,
    invCode: "",
    invType: "",
    invNHCode: "",
    invNHEnglishName: "",
    invNHGreekName: "",
    invSampleType: "",
    invShortName: "",
    methods: "",
    coopLabs: "",
    compID: compID || 0,
    compCode: compCode || "",
    compName: compName || "",
    rModifiedID: userID || 0,
    rModifiedBy: userName || "",
    rCreatedID: userID || 0,
    rCreatedBy: userName || "",
    rCreatedOn: serverDate || new Date(),
    rModifiedOn: serverDate || new Date(),
    transferYN: "Y",
    rActiveYN: "Y",
    lComponentsDto: [
      {
        mGrpID: 0,
      },
    ],
    investigationDto: {},
  });

  const debouncedUpdate = useCallback(
    debounce((newState: LInvMastDto) => {
      const formattedState = {
        ...newState,
        invType: String(newState.invType || ""),
        investigationDto: newState.investigationDto || {},
      };
      onUpdate(formattedState);
    }, 500),
    [onUpdate]
  );

  useEffect(() => {
    if (investigationData) {
      setFormState((prevState) => ({
        ...prevState,
        ...investigationData,
        invType: String(investigationData.invType || ""),
        compID: investigationData.compID || compID || 0,
        compCode: investigationData.compCode || compCode || "",
        compName: investigationData.compName || compName || "",
        rModifiedID: userID || 0,
        rModifiedBy: userName || "",
        rModifiedOn: serverDate || new Date(),
        investigationDto: investigationData.investigationDto || {},
      }));
    }
  }, [investigationData, compID, compCode, compName, userID, userName, serverDate]);

  const fetchInvestigationCodeSuggestions = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) return [];

    try {
      const response = await investigationlistService.getAll();
      return (
        response.data
          ?.filter((item: any) => {
            const invCode = item.lInvMastDto?.invCode?.toLowerCase();
            return invCode && invCode.startsWith(searchTerm.toLowerCase());
          })
          .map((item: any) => {
            const invCode = item.lInvMastDto?.invCode || "";
            const invName = item.lInvMastDto?.invName || "";
            return `${invCode} - ${invName}`;
          }) || []
      );
    } catch (error) {
      return [];
    }
  }, []);

  const updateInvestigationCode = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      invCode: "",
    }));

    setTimeout(() => {
      setFormState((prev) => ({
        ...prev,
        invCode: value,
      }));
    }, 10); // Small timeout to ensure re-render
  };

  useEffect(() => {
    if (shouldReset) {
      const initialState = {
        invID: 0,
        invName: "",
        invTypeCode: "",
        invReportYN: "N",
        invSampleYN: "N",
        invTitle: "",
        invSTitle: "",
        invPrintOrder: 0,
        deptID: 0,
        deptName: "",
        rCreatedOn: serverDate || new Date(),
        rModifiedOn: serverDate || new Date(),
        rCreatedID: 0,
        rCreatedBy: "",
        rModifiedID: 0,
        rModifiedBy: "",
        bchID: 0,
        invCode: "",
        invType: "",
        invNHCode: "",
        invNHEnglishName: "",
        invNHGreekName: "",
        invSampleType: "",
        invShortName: "",
        methods: "",
        coopLabs: "",
        transferYN: "Y",
        rActiveYN: "Y",
        compID: compID || 0,
        compCode: compCode || "",
        compName: compName || "",
        lComponentsDto: [
          {
            mGrpID: 0,
          },
        ],
        investigationDto: {},
      };

      setFormState(initialState);
      onUpdate(initialState);
    }
  }, [shouldReset, compID, compCode, compName, serverDate, onUpdate]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormState((prev) => {
        const updatedState = { ...prev, [name]: value };
        debouncedUpdate(updatedState);
        return updatedState;
      });
    },
    [debouncedUpdate]
  );

  const handleSelectChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      const { name, value } = e.target;
      setFormState((prev) => {
        const updatedState = { ...prev, [name]: String(value) };
        debouncedUpdate(updatedState);
        return updatedState;
      });
    },
    [debouncedUpdate]
  );

  const handleSwitchChange = useCallback(
    (name: string) => (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setFormState((prev) => {
        const updatedState = { ...prev, [name]: checked ? "Y" : "N" };
        debouncedUpdate(updatedState);
        return updatedState;
      });
    },
    [debouncedUpdate]
  );

  const filteredServiceOptions = dropdownValues.service?.filter((item) => item.isLabYN && item.isLabYN === "Y") || [];

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6">INVESTIGATION DETAILS</Typography>

      <Grid container spacing={2}>
        <FormField
          ControlID="invCode"
          label="Investigation Code"
          name="invCode"
          type="autocomplete"
          placeholder="Search or select a charge code"
          value={formState.invCode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;
            updateInvestigationCode(value);
          }}
          fetchSuggestions={fetchInvestigationCodeSuggestions}
          onSelectSuggestion={onCodeSelect}
          isSubmitted={isSubmitted}
          isMandatory={true}
          maxLength={60}
        />

        <FormField
          type="text"
          label="Name"
          value={formState.invName}
          onChange={handleInputChange}
          name="invName"
          ControlID="invName"
          placeholder="Enter Name"
          isMandatory={true}
          isSubmitted={isSubmitted}
        />
        <FormField
          type="text"
          label="Short Name"
          value={formState.invShortName}
          onChange={handleInputChange}
          name="invShortName"
          ControlID="invShortName"
          placeholder="Enter Short Name"
          maxLength={500}
          isSubmitted={isSubmitted}
          isMandatory={true}
        />

        <FormField
          type="select"
          label="Sample Type"
          value={String(formState.invSampleType || "")}
          onChange={handleSelectChange}
          name="invSampleType"
          ControlID="invSampleType"
          options={dropdownValues.sampleType || [{ value: "", label: "Loading..." }]}
        />

        <FormField
          type="select"
          label="Investigation Type"
          value={String(formState.bchID || "")}
          onChange={handleSelectChange}
          name="bchID"
          ControlID="bchID"
          options={filteredServiceOptions.length > 0 ? filteredServiceOptions : [{ value: "", label: "No Service Available" }]}
          isMandatory={true}
          isSubmitted={isSubmitted}
        />

        <FormField
          type="text"
          label="Resource Code"
          value={formState.invNHCode}
          onChange={handleInputChange}
          name="invNHCode"
          ControlID="invNHCode"
          placeholder="Enter Resource Code"
          maxLength={1000}
        />
        <FormField
          type="text"
          label="Resource Name"
          value={formState.invNHEnglishName}
          onChange={handleInputChange}
          name="invNHEnglishName"
          ControlID="invNHEnglishName"
          placeholder="Enter Resource Name"
          maxLength={1000}
        />

        <FormField
          type="text"
          label="Coop Labs"
          value={formState.coopLabs}
          onChange={handleInputChange}
          name="coopLabs"
          ControlID="coopLabs"
          placeholder="Enter Coop Labs Name"
          maxLength={500}
        />

        <FormField
          type="text"
          label="Method"
          value={formState.methods}
          onChange={handleInputChange}
          name="methods"
          ControlID="methods"
          placeholder="Enter Methods Name"
          maxLength={500}
        />
      </Grid>

      <Grid container spacing={2}>
        <FormField
          type="textarea"
          label="Comments"
          value={formState.invTitle}
          onChange={handleInputChange}
          name="invTitle"
          ControlID="invTitle"
          placeholder="Enter Comments"
          maxLength={1000}
        />
        <FormField
          type="switch"
          label="Report Entry Required"
          checked={formState.invReportYN === "Y"}
          onChange={handleSwitchChange("invReportYN")}
          name="invReportYN"
          ControlID="invReportYN"
          placeholder="Enter Resource Name"
          value={formState.invReportYN}
          maxLength={1000}
        />
        <FormField
          type="switch"
          label="Sample Required"
          checked={formState.invSampleYN === "Y"}
          onChange={handleSwitchChange("invSampleYN")}
          name="invSampleYN"
          ControlID="invSampleYN"
          placeholder="Enter Resource Name"
          value={formState.invSampleYN}
        />
      </Grid>
    </Paper>
  );
};

export default React.memo(InvestigationListDetails);
