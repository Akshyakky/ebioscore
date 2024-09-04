import React, { useContext, useState } from "react";
import { Container, Paper, Box } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { useLoading } from "../../../../context/LoadingContext";
import extractNumbers from "../../../../utils/PatientAdministration/extractNumbers";
import { AlertDto } from "../../../../interfaces/Common/AlertManager";
import AlertDetails from "../SubPage/AlertDetails";
import PatientSearch from "../../../patientAdministration/CommonPage/AdvanceSearch/PatientSearch";
import { PatientSearchContext } from "../../../../context/PatientSearchContext";
import ActionButtonGroup from "../../../../components/Button/ActionButtonGroup";
import { Search as SearchIcon } from "@mui/icons-material";
import { AlertManagerServices } from "../../../../services/CommonServices/AlertManagerServices";
import { PatientService } from "../../../../services/PatientAdministrationServices/RegistrationService/PatientService";

const AlertPage: React.FC = () => {
    const [selectedData, setSelectedData] = useState<AlertDto | undefined>(
        undefined
    );
    const { setLoading } = useLoading();
    const userInfo = useSelector((state: RootState) => state.userDetails);
    const token = userInfo.token!;
    const [showPatientSearch, setShowPatientSearch] = useState(false);
    const { performSearch } = useContext(PatientSearchContext);
    const [, setSelectedPChartID] = useState<number>(0);


    const handlePatientSelect = async (selectedSuggestion: string, pChartCode: string) => {
        debugger
        setLoading(true);
        try {
            const numbersArray = extractNumbers(pChartCode);
            const pChartID = numbersArray.length > 0 ? numbersArray[0] : null;
            if (pChartID) {
                await fetchPatientDetailsAndUpdateForm(pChartID);
                setSelectedPChartID(pChartID);
                const alertResult = await AlertManagerServices.GetAlertBypChartID(pChartID);
                if (alertResult.success && alertResult.data) {
                    setSelectedData({
                        ...alertResult.data,
                        pChartCode: pChartCode
                    });
                    console.error("The pChartCode is .", pChartCode);
                } else {
                    console.error("Failed to fetch alert details.");
                }
            }
        } finally {
            setLoading(false);
        }
    };
    const fetchPatientDetailsAndUpdateForm = async (pChartID: number) => {
        setLoading(true);
        try {
            const patientDetails = await PatientService.getPatientDetails(
                token,
                pChartID
            );
            if (patientDetails.success && patientDetails.data) {
            } else {
                console.error(
                    "Fetching patient details was not successful or data is undefined"
                );
            }
        } catch (error) {
            console.error("Error fetching patient details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdvancedSearch = async () => {
        setShowPatientSearch(true);
        await performSearch("");
    };

    return (
        <>
            <Container maxWidth={false}>
                <Box sx={{ marginBottom: 2 }}>
                    <ActionButtonGroup
                        buttons={[
                            {
                                variant: "contained",
                                size: "medium",
                                icon: SearchIcon,
                                text: "Advanced Search",
                                onClick: handleAdvancedSearch,
                            },
                        ]}
                    />
                </Box>
                <PatientSearch
                    show={showPatientSearch}
                    handleClose={() => setShowPatientSearch(false)}
                    onEditPatient={handlePatientSelect}
                />
                <Paper variant="outlined" sx={{ padding: 2 }}>
                    <AlertDetails editData={selectedData} />

                </Paper>


            </Container>
        </>
    );
};

export default AlertPage;
