import { Box, Container } from "@mui/material";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import Search from "@mui/icons-material/Search";
import { useState } from "react";
import ChargeDetails from "../SubPage/ChargesDetails";
import ChargeDetailsSearch from "../SubPage/ChargeDetailsSearch";
import { ChargeDetailsDto, BChargeDto } from "../../../../interfaces/Billing/BChargeDetails";

const ChargeDetailsPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<ChargeDetailsDto | undefined>(undefined);

  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (data: BChargeDto) => {
    const chargeDetailsData: ChargeDetailsDto = {
      chargeInfo: {
        chargeID: data.chargeID,
        chargeCode: data.chargeCode,
        chargeDesc: data.chargeDesc ?? "",
        chargeType: data.chargeType,
        cShortName: data.cShortName,
        compID: 0,
        compCode: "",
        compName: "",
        chargeCost: data.chargeCost,
        rActiveYN: "Y",
        transferYN: "Y",
        rNotes: "",
        chargeBreakYN: "N",
        bChID: 0,
        regServiceYN: data.regServiceYN,
        doctorShareYN: "N",
        cNhsCode: data.cNhsCode || "",
        chargeStatus: "",
        sGrpID: data.sGrpID,
        chargeTo: "",
        cNhsEnglishName: data.cNhsEnglishName ?? "",
      },
      // Populate default chargeDetails
      chargeDetails: [
        {
          chDetID: 0,
          chargeID: data.chargeID,
          pTypeID: 1,
          wCatID: 1,
          dcValue: 0,
          hcValue: 0,
          chValue: 0,
          chargeStatus: "A",
          compID: 0,
          compCode: "",
          compName: "",
          rActiveYN: "",
          transferYN: "",
          rNotes: "",
        },
        // Add more items if needed
      ],
      // Populate default chargeAliases
      chargeAliases: [
        {
          chaliasID: 0,
          chargeID: data.chargeID,
          pTypeID: 1,
          chargeDesc: "Default Alias",
          chargeDescLang: "en",
          compID: 0,
          compCode: "",
          compName: "",
          rActiveYN: "",
          transferYN: "",
          rNotes: "",
        },
        // Add more items if needed
      ],
      // Populate default faculties
      faculties: [
        {
          bchfID: 0,
          chargeID: data.chargeID,
          aSubID: 1,
          compID: 0,
          compCode: "",
          compName: "",
          rActiveYN: "",
          transferYN: "",
          rNotes: "",
        },
        // Add more items if needed
      ],
    };

    setSelectedData(chargeDetailsData);
    setIsSearchOpen(false);
  };

  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      icon: Search,
      text: "Advanced Search",
      onClick: handleAdvancedSearch,
    },
  ];

  return (
    <Container maxWidth={false}>
      <Box sx={{ marginBottom: 2 }}>
        <ActionButtonGroup buttons={actionButtons} />
      </Box>
      <ChargeDetailsSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
      <ChargeDetails editData={selectedData} />
    </Container>
  );
};

export default ChargeDetailsPage;
