import { Box, Container, Paper } from "@mui/material";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import Search from "@mui/icons-material/Search";
import PatientInvoiceCodeDetails from "../SubPage/PatientInvoiceCodeDetails";

const PatientInvoiceCodePage: React.FC = () => {
    const handleAdvancedSearch = async () => { }

    const actionButtons: ButtonProps[] = [
        {
            variant: "contained",
            icon: Search,
            text: "Advanced Search",
            onClick: handleAdvancedSearch,
        }
    ];

    return (
        <>
            <Container maxWidth={false}>
                <Box sx={{ marginBottom: 2 }}>
                    <ActionButtonGroup buttons={actionButtons} groupVariant="contained" groupSize="medium" orientation="horizontal" color="primary" />
                </Box>
                <PatientInvoiceCodeDetails />
            </Container>

        </>
    );
}

export default PatientInvoiceCodePage;
