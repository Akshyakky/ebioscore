// src/pages/clinicalManagement/PatientHistory/PatientHistorySection.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { Paper, Tabs, Tab, Box, useTheme } from '@mui/material';
import AddAllergiesHistory from './Allergies/AddAllergiesPage';
import AddPastMedicalHistory from './PastMedicalHistory/AddPastMedicalHistory';
import AddPastSurgicalHistory from './PastSurgicalHistory/AddPastSurgicalHistory';
import AddPastMedicationHistory from './PastMedicationHistory/AddPastMedicationHistory';
import AddPastReviewOfSystem from './PastReviewOfSystem/AddPastReviewOfSystem';
import AddSocialHistory from './PastSocialHistory/AddSocialHistory';
import AddFamilyHistory from './FamilyHistory/AddFamilyHistory';
import { OPIPHistPSHDto } from '../../../interfaces/ClinicalManagement/OPIPHistPSHDto';
import { OPIPHistPMHDto } from '../../../interfaces/ClinicalManagement/OPIPHistPMHDto';
import { OPIPHistROSDto } from '../../../interfaces/ClinicalManagement/OPIPHistROSDto';
import { OPIPHistSHDto } from '../../../interfaces/ClinicalManagement/OPIPHistSHDto';
import { OPIPHistFHDto } from '../../../interfaces/ClinicalManagement/OPIPHistFHDto';

interface PatientHistorySectionProps {
    pChartID: number;
    opipNo: number;
    opipCaseNo: number;
    shouldClear: boolean;
    onHistoryChange: (historyData: any) => void;
    showImmediateSave: boolean;
}
const PatientHistorySection: React.FC<PatientHistorySectionProps> = ({
    pChartID,
    opipNo,
    opipCaseNo,
    shouldClear,
    onHistoryChange,
    showImmediateSave
}) => {
    const [activeHistoryTab, setActiveHistoryTab] = useState(0);
    const theme = useTheme();

    const [allergiesData, setAllergiesData] = useState([]);
    const [pastMedicalData, setPastMedicalData] = useState<OPIPHistPMHDto>({} as OPIPHistPMHDto);
    const [pastSurgicalData, setPastSurgicalData] = useState<OPIPHistPSHDto>({} as OPIPHistPSHDto);
    const [pastMedicationData, setPastMedicationData] = useState([]);
    const [reviewOfSystemData, setReviewOfSystemData] = useState<OPIPHistROSDto>({} as OPIPHistROSDto);
    const [socialHistoryData, setSocialHistoryData] = useState<OPIPHistSHDto>({} as OPIPHistSHDto);
    const [familyHistoryData, setFamilyHistoryData] = useState<OPIPHistFHDto>({} as OPIPHistFHDto);

    useEffect(() => {
        if (shouldClear) {
            setActiveHistoryTab(0);
            setAllergiesData([]);
            setPastMedicalData({} as OPIPHistPMHDto);
            setPastSurgicalData({} as OPIPHistPSHDto);
            setPastMedicationData([]);
            setReviewOfSystemData({} as OPIPHistROSDto);
            setSocialHistoryData({} as OPIPHistSHDto);
            setFamilyHistoryData({} as OPIPHistFHDto);
        }
    }, [shouldClear]);

    const handleHistoryTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveHistoryTab(newValue);
    };

    const handleHistoryDataChange = useCallback((type: string, data: any) => {
        switch (type) {
            case 'allergies':
                setAllergiesData(data);
                break;
            case 'pastMedicalHistory':
                setPastMedicalData(data);
                break;
            case 'pastSurgicalHistory':
                setPastSurgicalData(data);
                break;
            case 'pastMedication':
                setPastMedicationData(data);
                break;
            case 'reviewOfSystem':
                setReviewOfSystemData(data);
                break;
            case 'socialHistory':
                setSocialHistoryData(data);
                break;
            case 'familyHistory':
                setFamilyHistoryData(data);
                break;
        }
        onHistoryChange({ type, data, pChartID, opipNo, opipCaseNo });
    }, [pChartID, opipNo, opipCaseNo, onHistoryChange]);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                bgcolor: theme.palette.background.paper,
                color: theme.palette.text.primary
            }}
        >
            <Tabs
                value={activeHistoryTab}
                onChange={handleHistoryTabChange}
                aria-label="patient history tabs"
                textColor="primary"
                indicatorColor="primary"
            >
                <Tab label="Allergies" />
                <Tab label="Past Medical History" />
                <Tab label="Past Surgical History" />
                <Tab label="Past Medication History" />
                <Tab label="Review of System" />
                <Tab label="Social History" />
                <Tab label="Family History" />
            </Tabs>
            <Box sx={{ mt: 2 }}>
                {activeHistoryTab === 0 && (
                    <AddAllergiesHistory
                        pChartId={pChartID}
                        opipNo={opipNo}
                        opipCaseNo={opipCaseNo}
                        onHistoryChange={(data) => handleHistoryDataChange('allergies', data)}
                        showImmediateSave={showImmediateSave}
                        allergiesData={allergiesData}
                    />
                )}
                {activeHistoryTab === 1 && (
                    <AddPastMedicalHistory
                        pchartId={pChartID}
                        opipNo={opipNo}
                        opipCaseNo={opipCaseNo}
                        onHistoryChange={(data) => handleHistoryDataChange('pastMedicalHistory', data)}
                        showImmediateSave={showImmediateSave}
                        pastMedicalData={pastMedicalData}
                    />
                )}
                {activeHistoryTab === 2 && (
                    <AddPastSurgicalHistory
                        pchartId={pChartID}
                        opipNo={opipNo}
                        opipCaseNo={opipCaseNo}
                        onHistoryChange={(data) => handleHistoryDataChange('pastSurgicalHistory', data)}
                        showImmediateSave={showImmediateSave}
                        pastSurgicalData={pastSurgicalData}
                    />
                )}
                {activeHistoryTab === 3 && (
                    <AddPastMedicationHistory
                        pchartId={pChartID}
                        opipNo={opipNo}
                        opipCaseNo={opipCaseNo}
                        onHistoryChange={(data) => handleHistoryDataChange('pastMedication', data)}
                        showImmediateSave={showImmediateSave}
                        pastMedicationData={pastMedicationData}
                    />
                )}
                {activeHistoryTab === 4 && (
                    <AddPastReviewOfSystem
                        pchartId={pChartID}
                        opipNo={opipNo}
                        opipCaseNo={opipCaseNo}
                        onHistoryChange={(data) => handleHistoryDataChange('reviewOfSystem', data)}
                        showImmediateSave={showImmediateSave}
                        reviewOfSystemData={reviewOfSystemData}
                    />
                )}
                {activeHistoryTab === 5 && (
                    <AddSocialHistory
                        pchartId={pChartID}
                        opipNo={opipNo}
                        opipCaseNo={opipCaseNo}
                        onHistoryChange={(data) => handleHistoryDataChange('socialHistory', data)}
                        showImmediateSave={showImmediateSave}
                        socialHistoryData={socialHistoryData}
                    />
                )}
                {activeHistoryTab === 6 && (
                    <AddFamilyHistory
                        pchartId={pChartID}
                        opipNo={opipNo}
                        opipCaseNo={opipCaseNo}
                        onHistoryChange={(data) => handleHistoryDataChange('familyHistory', data)}
                        showImmediateSave={showImmediateSave}
                        familyHistoryData={familyHistoryData}
                    />
                )}
            </Box>
        </Paper>
    );
};

export default React.memo(PatientHistorySection);

// src/pages/clinicalManagement/PatientHistoryPage/PatientHistoryPage.tsx

// import React, { useState } from 'react';
// import { Container, Typography } from '@mui/material';
// import PatientHistorySection from '../PatientHistory/PatientHistorySection';

// const PatientHistoryPage: React.FC = () => {
//   const [patientHistory, setPatientHistory] = useState<any>({});

//   const handleHistoryChange = (historyData: any) => {
//     setPatientHistory(prevHistory => ({
//       ...prevHistory,
//       [historyData.type]: historyData
//     }));
//   };

//   // You would typically get these values from your application state or route parameters
//   const pChartID = 0; // Replace with actual pChartID
//   const opipNo = 0; // Replace with actual opipNo
//   const opipCaseNo = 0; // Replace with actual opipCaseNo

//   return (
//     <Container maxWidth={false}>
//       <Typography variant="h4" gutterBottom>Patient History</Typography>
//       <PatientHistorySection
//         pChartID={pChartID}
//         opipNo={opipNo}
//         opipCaseNo={opipCaseNo}
//         shouldClear={false}
//         onHistoryChange={handleHistoryChange}
//         showImmediateSave={true}
//       />
//     </Container>
//   );
// };

// export default PatientHistoryPage;