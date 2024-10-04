import React, { useCallback, useState } from 'react';
import { Box, Container, Typography } from "@mui/material";
import ProductOverviewDetail from "../SubPage/ProductOverviewDetails";
import GenericDialog from "../../../../components/GenericDialog/GenericDialog";
import FormField from "../../../../components/FormField/FormField";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import CustomButton from "../../../../components/Button/CustomButton";
import { ThumbUp } from "@mui/icons-material";
import Close from "@mui/icons-material/Close";
import { ProductOverviewDto } from "../../../../interfaces/InventoryManagement/ProductOverviewDto";
import ActionButtonGroup, { ButtonProps } from '../../../../components/Button/ActionButtonGroup';
import ProductOverviewSearch from '../SubPage/ProductOverviewSearch';
import Search from "@mui/icons-material/Search";

const ProductOverviewPage: React.FC = () => {
    const [selectedData, setSelectedData] = useState<ProductOverviewDto>({
        pvID: 0,
        productID: 0,
        fsbCode: '',
        supplierAllocation: '',
        poStatus: '',
        deptID: 0,
        department: '',
        defaultYN: 'N',
        isAutoIndentYN: 'N',
        rActiveYN: 'Y',
        compID: 0,
        compCode: '',
        compName: '',
        transferYN: 'N',
    });

    const [dialogOpen, setDialogOpen] = useState(true);
    const [isDepartmentSelected, setIsDepartmentSelected] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { handleDropdownChange } = useDropdownChange<ProductOverviewDto>(setSelectedData);

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const handleOkClick = () => {
        setIsDepartmentSelected(selectedData.deptID !== 0);
        if (selectedData.deptID === 0) {
            alert("Please select a department.");
        } else {
            setDialogOpen(false);
        }
    };

    const handleDepartmentChange = () => {
        setDialogOpen(true);
    };
    const handleAdvancedSearch = useCallback(() => {
        setIsSearchOpen(true);
    }, []);

    const handleCloseSearch = useCallback(() => {
        setIsSearchOpen(false);
    }, []);

    const handleSelect = useCallback((data: ProductOverviewDto) => {
        setSelectedData(data);
    }, []);
    const actionButtons: ButtonProps[] = [
        {
            variant: "contained",
            icon: Search,
            text: "Advanced Search",
            onClick: handleAdvancedSearch,
        },
    ];
    const dropdownValues = useDropdownValues(['department']);
    const isSubmitted = false;
    return (
        <Container maxWidth={false}>
            <Box sx={{ marginBottom: 2 }}>
                <ActionButtonGroup buttons={actionButtons} groupVariant="contained" groupSize="medium" orientation="horizontal" color="primary" />
            </Box>
            <Box sx={{ marginBottom: 2 }} />

            {isDepartmentSelected && (
                <ProductOverviewDetail
                    selectedData={selectedData}
                    onChangeDepartment={handleDepartmentChange}
                />
            )}
            <GenericDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                title="Select Department"
                maxWidth="sm"
            >
                <Typography variant="h6" gutterBottom>
                    Please select a department
                </Typography>
                <FormField
                    type="select"
                    label="Department"
                    name="deptID"
                    ControlID="Department"
                    value={selectedData.deptID === 0 ? "" : String(selectedData.deptID)}
                    options={dropdownValues.department}
                    onChange={handleDropdownChange(
                        ["deptID"],
                        ["department"],
                        dropdownValues.department
                    )}
                    isMandatory={true}
                    isSubmitted={isSubmitted}
                    gridProps={{ xs: 12, sm: 6, md: 6 }}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
                    <CustomButton
                        variant="contained"
                        onClick={handleCloseDialog}
                        text="Close"
                        sx={{ marginRight: 1 }}
                        color="error"
                        icon={Close}
                    />
                    <CustomButton
                        variant="contained"
                        onClick={handleOkClick}
                        text="OK"
                        color="success"
                        icon={ThumbUp}
                    />
                </Box>
            </GenericDialog>
            <ProductOverviewSearch
                open={isSearchOpen}
                onClose={handleCloseSearch}
                onSelect={handleSelect}
                selectedDeptID={selectedData.deptID}  // Pass the selected department ID here
            />
        </Container>
    );
};

export default ProductOverviewPage;
