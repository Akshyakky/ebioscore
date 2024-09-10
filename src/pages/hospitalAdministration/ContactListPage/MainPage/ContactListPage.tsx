import React, { useState } from "react";
import { Box, Container, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import ActionButtonGroup, {
  ButtonProps,
} from "../../../../components/Button/ActionButtonGroup";
import { useLoading } from "../../../../context/LoadingContext";
import { RootState } from "../../../../store/reducers";
import { ContactListService } from "../../../../services/HospitalAdministrationServices/ContactListService/ContactListService";
import { ContactListData } from "../../../../interfaces/HospitalAdministration/ContactListData";
import ContactListSearch from "../../CommonPage/AdvanceSearch/ContactListSearch";
import ContactListForm from "../SubPage/ContactListForm";

const ContactListPage: React.FC = () => {
  const { compID, userID, userName, compCode, compName } = useSelector(
    (state: RootState) => state.userDetails
  );

  const [contactList, setContactList] = useState<ContactListData>(
    getInitialContactListState(userID!, userName!, compID!, compCode!, compName!)
  );

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

  const handleEditContactList = async (conID: number) => {
    setLoading(true);
    try {
      const contactDetails = await ContactListService.fetchContactDetails(conID);
      if (
        contactDetails &&
        contactDetails.contactMastDto &&
        contactDetails.contactAddressDto && contactDetails.contactDetailsDto
      ) {
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

  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      size: "medium",
      icon: SearchIcon,
      text: "Advanced Search",
      onClick: handleAdvancedSearch,
    },
  ];

  return (
    <>
      <Container maxWidth={false}>
        <Box sx={{ marginBottom: 2 }}>
          <ActionButtonGroup buttons={actionButtons} />
        </Box>
        <Paper variant="elevation" sx={{ padding: 2 }}>
          <ContactListForm
            contactList={contactList}
            setContactList={setContactList}
            switchStates={switchStates}
            setSwitchStates={setSwitchStates}
          />
        </Paper>
      </Container>
      <ContactListSearch
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onEditContactList={handleEditContactList}
      />
    </>
  );
};

export default ContactListPage;

function getInitialContactListState(
  userID: number,
  userName: string,
  compID: number,
  compCode: string,
  compName: string
): ContactListData {
  const today = new Date().toISOString().split("T")[0];
  return {
    contactMastDto: {
      conID: 0,
      conCode: "",
      conTitle: "",
      conFName: "",
      conLName: "",
      conMName: "",
      conDob: today,
      conGender: "",
      conSSNID: "",
      conBldGrp: "",
      conCat: "",
      consValue: "",
      conEmpYN: "N",
      rActiveYN: "Y",
      rCreatedOn: today,
      rCreatedID: userID,
      rCreatedBy: userName,
      rModifiedOn: today,
      rModifiedID: userID,
      rModifiedBy: userName,
      compID: compID,
      compCode: compCode,
      compName: compName,
      notes: "",
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
      compID: compID,
      compCode: compCode,
      compName: compName,
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
    },
    contactDetailsDto: []
  };
}
