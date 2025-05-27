import React, { useCallback, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { ContactListData, ContactMastData } from "@/interfaces/HospitalAdministration/ContactListData";
import { useLoading } from "@/hooks/Common/useLoading";
import { ContactListService } from "@/services/HospitalAdministrationServices/ContactListService/ContactListService";
import { useAlert } from "@/providers/AlertProvider";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import { Box, Container, Paper } from "@mui/material";
import ContactListForm from "../SubPage/ContactListForm";
import ContactListSearch from "../../CommonPage/AdvanceSearch/ContactListSearch";
import { ContactService } from "@/services/HospitalAdministrationServices/ContactListService/ContactService";
const contactService = new ContactService();
const ContactListPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [selectedData, setSelectedData] = useState<ContactMastData | undefined>(undefined);
  const serverDate = useServerDate();

  const getInitialContactListState = useMemo(() => {
    return {
      contactMastDto: {
        conID: 0,
        conCode: "",
        conTitle: "",
        conFName: "",
        conLName: "",
        conMName: "",
        conDob: serverDate,
        conGender: "",
        conSSNID: "",
        conBldGrp: "",
        conCat: "",
        consValue: "",
        conEmpYN: "N",
        rActiveYN: "Y",
        rNotes: "",
        conEmpStatus: "",
        allergicToAllergence: "",
        allergicToMedicine: "",
        aPHYRMID: 0,
        aPhyRoomName: "",
        deptID: 0,
        deptName: "",
        designation: "",
        emergenContactName: "",
        iPP: 0,
        oPP: 0,
        isAuthorizedUserYN: "N",
        isContractYN: "N",
        isSuperSpecialtyYN: "N",
        isEmployeeYN: "N",
        isRefferalYN: "N",
        isAppointmentYN: "N",
        isUserRequiredYN: "N",
        maritalStatus: "",
        tINNo: "",
        accCode: "",
        accPayCode: "",
        gESYCode: "",
        digSignPath: "",
        stampPath: "",
        payPolicy: 0,
        transferYN: "N",
      },
      contactAddressDto: {
        cAddID: 0,
        conID: 0,
        conCode: "",
        cAddType: "",
        cAddMail: "N",
        cAddPostCode: "",
        cAddPSSID: "",
        cAddCity: "",
        cAddCountry: "",
        cAddEmail: "",
        cAddPhone1: "",
        cAddPhone2: "",
        cAddPhone3: "",
        cAddState: "",
        cAddStreet: "",
        cAddStreet1: "",
        transferYN: "N",
        rActiveYN: "Y",
        rNotes: "",
      },
      contactDetailsDto: [],
    };
  }, []);

  const [contactList, setContactList] = useState<ContactListData>(getInitialContactListState);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { setLoading } = useLoading();

  const [switchStates, setSwitchStates] = useState({
    isEmployee: false,
    isReferral: false,
    isAppointment: false,
    isSuperSpeciality: false,
    isUserRequired: false,
    isAuthorisedUser: false,
    isContract: false,
  });

  const handleAdvancedSearch = async () => {
    setIsSearchOpen(true);
  };
  const handleSelect = useCallback((data: ContactMastData) => {
    setSelectedData(data);
  }, []);
  const handleEditContactList = async (conID: number) => {
    setLoading(true);
    try {
      const contactDetails = await ContactListService.fetchContactDetails(conID);
      if (contactDetails && contactDetails.contactMastDto && contactDetails.contactAddressDto && contactDetails.contactDetailsDto) {
        setContactList(contactDetails);
        setSwitchStates({
          isEmployee: contactDetails.contactMastDto.isEmployeeYN === "Y",
          isReferral: contactDetails.contactMastDto.isRefferalYN === "Y",
          isAppointment: contactDetails.contactMastDto.isAppointmentYN === "Y",
          isSuperSpeciality: contactDetails.contactMastDto.isSuperSpecialtyYN === "Y",
          isUserRequired: contactDetails.contactMastDto.isUserRequiredYN === "Y",
          isAuthorisedUser: contactDetails.contactMastDto.isAuthorizedUserYN === "Y",
          isContract: contactDetails.contactMastDto.isContractYN === "Y",
        });
      } else {
        throw new Error("Invalid contact details structure");
      }
    } catch (error) {
      console.error("Error fetching contact details:", error);
    } finally {
      setLoading(false);
      setIsSearchOpen(false);
    }
  };

  const handleClear = useCallback(() => {
    setContactList(getInitialContactListState);
    setSwitchStates({
      isEmployee: false,
      isReferral: false,
      isAppointment: false,
      isSuperSpeciality: false,
      isUserRequired: false,
      isAuthorisedUser: false,
      isContract: false,
    });
  }, [getInitialContactListState]);

  const handleSave = useCallback(async () => {
    setLoading(true);

    try {
      const result = await contactService.saveContactList(contactList);
      if (result.success) {
        showAlert("Notification", "Contact list saved successfully", "success", {
          onConfirm: () => {
            handleClear();
            if (formRef.current) {
              formRef.current.resetForm();
            }
          },
        });
      } else {
        showAlert("Error", result.errorMessage || "Failed to save contact list.", "error");
      }
    } catch (error) {
      showAlert("Error", "An unexpected error occurred while saving the contact list.", "error");
    } finally {
      setLoading(false);
    }
  }, [contactList, handleClear]);

  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      size: "medium",
      icon: SearchIcon,
      text: "Advanced Search",
      onClick: handleAdvancedSearch,
    },
  ];

  const formRef = React.useRef<{ resetForm: () => void } | null>(null);

  return (
    <>
      <Container maxWidth={false}>
        <Box sx={{ marginBottom: 2 }}>
          <ActionButtonGroup buttons={actionButtons} />
        </Box>
        <Paper variant="elevation" sx={{ padding: 2 }}>
          <ContactListForm
            ref={formRef}
            contactList={contactList}
            setContactList={setContactList}
            switchStates={switchStates}
            setSwitchStates={setSwitchStates}
            onSave={handleSave}
            onClear={handleClear}
          />
        </Paper>
      </Container>
      <ContactListSearch open={isSearchOpen} onClose={() => setIsSearchOpen(false)} onSelect={handleSelect} />
    </>
  );
};

export default ContactListPage;
