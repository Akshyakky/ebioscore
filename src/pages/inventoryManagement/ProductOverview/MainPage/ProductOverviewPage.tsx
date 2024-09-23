import { ProductOverviewDto } from "../../../../interfaces/InventoryManagement/ProductOverviewDto";
import { Box, Container, Typography } from "@mui/material";
import ProductOverviewDetail from "../SubPage/ProductOverviewDetails";
import { useState } from "react";
import GenericDialog from "../../../../components/GenericDialog/GenericDialog";
import FormField from "../../../../components/FormField/FormField";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import CustomButton from "../../../../components/Button/CustomButton";
import { ThumbUp } from "@mui/icons-material";
import Close from "@mui/icons-material/Close";

const ProductOverviewPage: React.FC = () => {
    const [selectedData, setSelectedData] = useState<ProductOverviewDto>({
        pvID: 0,
        productID: 0,
        fsbCode: '',
        supplierAllocation: '',
        poStatus: '',
        deptID: 0,
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

    const { departmentValues } = useDropdownValues();
    const isSubmitted = false;

    return (
        <Container maxWidth={false}>
            <Box sx={{ marginBottom: 2 }} />

            {isDepartmentSelected && <ProductOverviewDetail selectedData={selectedData} />}

            <GenericDialog
                open={dialogOpen}
                onClose={() => { handleCloseDialog }}
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
                    options={departmentValues}
                    onChange={handleDropdownChange(
                        ["deptID"],
                        ["deptName"],
                        departmentValues
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
        </Container>
    );
};

export default ProductOverviewPage;
