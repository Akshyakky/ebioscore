import { Box, Container } from "@mui/material";
import React, { useEffect } from "react";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import Search from "@mui/icons-material/Search";
import { useState } from "react";
import { ChargeDetailsDto } from "@/interfaces/Billing/BChargeDetails";
import ChargeDetailsSearch from "../SubPage/ChargeDetailsSearch";
import ChargeDetails from "../SubPage/ChargesDetails";
import { useAlert } from "@/providers/AlertProvider";
import { chargeDetailsService } from "@/services/BillingServices/ChargeDetailsService";

const ChargeDetailsPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<ChargeDetailsDto | undefined>(undefined);
  const { showAlert } = useAlert();

  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };
  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  useEffect(() => {
    if (selectedData) {
    }
  }, [selectedData]);
  const handleSelect = async (item: any) => {
    try {
      if (!item?.chargeID) {
        showAlert("Error", "Invalid item selected.", "error");
        return;
      }

      const response = await chargeDetailsService.getAllByID(item.chargeID);
      if (response.success && response.data) {
        const rawData = response.data;
        setSelectedData({ ...rawData, chargeAliases: rawData.chargeAliases || [] });
        setSelectedData({ ...rawData, chargeDetails: rawData.chargeDetails || [] });
        setSelectedData({ ...rawData, chargeFaculties: rawData.chargeFaculties || [] });
        setSelectedData({ ...rawData, chargeInfo: rawData.chargeInfo || [] });
        setSelectedData({ ...rawData, chargePackDetails: rawData.chargePackDetails || [] });
        setSelectedData({ ...rawData, doctorSharePerShare: rawData.doctorSharePerShare || [] });
        setIsSearchOpen(false);
      } else {
        showAlert("Error", "Failed to fetch charge details.", "error");
      }
    } catch (error) {
      console.error("Error fetching charge details:", error);
      showAlert("Error", "An error occurred while fetching charge details.", "error");
    }
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
