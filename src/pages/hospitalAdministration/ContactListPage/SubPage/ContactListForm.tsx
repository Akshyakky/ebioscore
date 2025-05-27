import React from "react";
import { useState, useMemo, useCallback, forwardRef, useImperativeHandle, useEffect } from "react";
import { Grid, SelectChangeEvent, Typography } from "@mui/material";

import useDropdownChange from "@/hooks/useDropdownChange";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues, { DropdownType } from "@/hooks/PatientAdminstration/useDropdownValues";
import useFieldsList from "@/components/FieldsList/UseFieldsList";
import { ContactListService } from "@/services/HospitalAdministrationServices/ContactListService/ContactListService";
import { AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedListDto";
import FormField from "@/components/FormField/FormField";
import ContactListSwitches from "./ContactListSwitches";
import ContactListActions from "./ContactListActions";
import ModifiedFieldDialog from "@/components/ModifiedFieldDailog/ModifiedFieldDailog";
import { useAlert } from "@/providers/AlertProvider";
import { ContactListData } from "@/interfaces/HospitalAdministration/ContactListData";

type SwitchStates = {
  isEmployee: boolean;
  isReferral: boolean;
  isAppointment: boolean;
  isSuperSpeciality: boolean;
  isUserRequired: boolean;
  isAuthorisedUser: boolean;
  isContract: boolean;
};

interface ContactListFormProps {
  contactList: ContactListData;
  setContactList: React.Dispatch<React.SetStateAction<ContactListData>>;
  switchStates: SwitchStates;
  setSwitchStates: React.Dispatch<React.SetStateAction<SwitchStates>>;
  onSave: () => Promise<void>;
  onClear: () => void;
}

const ContactListForm = forwardRef<{ resetForm: () => void }, ContactListFormProps>(({ contactList, setContactList, switchStates, setSwitchStates, onSave, onClear }, ref) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { handleDropdownChange } = useDropdownChange<ContactListData>(setContactList);
  const { showAlert } = useAlert();
  const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>([]);
  const serverDate = useServerDate();
  const { refreshDropdownValues, ...dropdownValues } = useDropdownValues([
    "title",
    "gender",
    "bloodGroup",
    "maritalStatus",
    "city",
    "state",
    "nationality",
    "category",
    "department",
    "employeeStatus",
    "speciality",
    "employeeRoom",
  ]);
  const { fieldsList, defaultFields } = useFieldsList(["city", "state", "nationality"]);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [dialogCategory, setDialogCategory] = useState<string>("");

  useEffect(() => {
    if (contactList.contactDetailsDto.length > 0) {
      const specialties = contactList.contactDetailsDto.filter((detail) => detail.facName).map((detail) => detail.facName.toString());
      setSelectedSpecialities(specialties);
    }
  }, [contactList]);

  const handleSpecialityChange = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const selectedValues = event.target.value as string[];
      setSelectedSpecialities(selectedValues);
      const selectedNames = selectedValues
        .map((val) => dropdownValues.speciality?.find((opt) => opt.value === val)?.label || "")
        .filter(Boolean)
        .join(", ");

      setContactList((prev) => ({
        ...prev,
        contactDetailsDto: selectedValues.map((val) => ({
          facID: parseInt(val),
          facName: dropdownValues.speciality?.find((opt) => opt.value === val)?.label || "",
          transferYN: "N",
          cdID: 0,
          conID: prev.contactMastDto.conID,
          conType: "",
          rActiveYN: "Y",
          rNotes: "",
        })),
        contactMastDto: {
          ...prev.contactMastDto,
          specialityNames: selectedNames,
        },
      }));
    },
    [dropdownValues.speciality, setContactList]
  );

  const handleCategoryChange = useCallback(
    async (event: SelectChangeEvent<unknown>) => {
      const selectedCategory = event.target.value as string;
      const selectedPhysician = selectedCategory === "PHY";

      setContactList((prev) => ({
        ...prev,
        contactMastDto: {
          ...prev.contactMastDto,
          consValue: selectedCategory,
          conCat: selectedCategory,
          conTitle: selectedPhysician ? "DR" : "",
        },
      }));
      if (selectedCategory)
        try {
          const result = await ContactListService.generateContactCode(selectedCategory, 5);
          if (result) {
            setContactList((prev: any) => ({
              ...prev,
              contactMastDto: {
                ...prev.contactMastDto,
                conCode: result,
              },
            }));
          } else {
            showAlert("Error", "Failed to generate code", "error");
          }
        } catch (error) {
          showAlert("Error", "An error occurred while generating the contact code", "error");
        }
    },
    [setContactList]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactList((prev) => {
      if (name === "conCode") {
        return {
          ...prev,
          contactMastDto: { ...prev.contactMastDto, conCode: value },
          contactAddressDto: { ...prev.contactAddressDto, conCode: value },
        };
      }
      if (name === "conFName") {
        return {
          ...prev,
          contactMastDto: { ...prev.contactMastDto, conFName: value.toUpperCase() },
        };
      }
      if (name === "conLName") {
        return {
          ...prev,
          contactMastDto: { ...prev.contactMastDto, conLName: value.toUpperCase() },
        };
      }
      if (name in prev.contactAddressDto) {
        return {
          ...prev,
          contactAddressDto: { ...prev.contactAddressDto, [name]: value },
        };
      }

      return {
        ...prev,
        contactMastDto: { ...prev.contactMastDto, [name]: value },
      };
    });
  }, []);

  const handleSwitchChange = useCallback(
    (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const checkedValue = event.target.checked ? "Y" : "N";
      setSwitchStates((prev) => ({ ...prev, [name]: event.target.checked }));
      setContactList((prev) => ({
        ...prev,
        contactMastDto: { ...prev.contactMastDto, [`${name}YN`]: checkedValue },
        contactAddressDto: name === "isEmployee" || name === "isAuthorisedUser" ? { ...prev.contactAddressDto, [`${name}YN`]: checkedValue } : prev.contactAddressDto,
      }));
    },
    [setSwitchStates, setContactList]
  );
  const isContactMastValid = (): boolean => {
    const contactMast = contactList.contactMastDto;

    if (!contactMast.consValue) return false;

    if (contactMast.consValue === "PHY") {
      if (!contactMast.accCode || selectedSpecialities.length === 0) return false;
    }

    const requiredFields = [contactMast.conTitle, contactMast.conFName, contactMast.conLName, contactMast.conGender];

    return requiredFields.every(Boolean);
  };

  const handleSave = useCallback(async () => {
    setIsSubmitted(true);

    if (!isContactMastValid()) {
      return;
    }
    await onSave();
  }, [onSave]);

  const handleClear = useCallback(() => {
    onClear();
    setSelectedSpecialities([]);
    setIsSubmitted(false);
  }, [onClear]);

  useImperativeHandle(ref, () => ({
    resetForm: () => {
      setSelectedSpecialities([]);
      setIsSubmitted(false);
    },
  }));

  const handleDateChange = useCallback(
    (date: Date | null) => {
      setContactList((prev) => ({
        ...prev,
        contactMastDto: { ...prev.contactMastDto, conDob: date ? date : serverDate },
      }));
    },
    [setContactList]
  );
  const [, setFormDataDialog] = useState<AppModifyFieldDto>({
    amlID: 0,
    amlName: "",
    amlCode: "",
    amlField: "",
    defaultYN: "N",
    modifyYN: "N",
    rNotes: "",
    rActiveYN: "Y",
    transferYN: "Y",
  });

  const handleAddField = (category: string) => {
    setDialogCategory(category);
    setFormDataDialog({
      amlID: 0,
      amlName: "",
      amlCode: "",
      amlField: category,
      defaultYN: "N",
      modifyYN: "N",
      rNotes: "",
      rActiveYN: "Y",
      transferYN: "Y",
    });
    setIsFieldDialogOpen(true);
  };

  const handleFieldDialogClose = () => {
    setIsFieldDialogOpen(false);
  };

  const onFieldAddedOrUpdated = () => {
    if (dialogCategory) {
      const dropdownMap: Record<string, DropdownType> = {
        EMPROOM: "employeeRoom",
        NATIONALITY: "nationality",
        CITY: "city",
        STATE: "state",
      };
      const dropdownType = dropdownMap[dialogCategory];
      if (dropdownType) {
        refreshDropdownValues(dropdownType);
      }
    }
  };

  const renderFormFields = useMemo(
    () => (
      <>
        <section>
          <Grid container spacing={2} alignItems="flex-start">
            <FormField
              type="select"
              label="Category"
              name="conCat"
              ControlID="Category"
              value={contactList.contactMastDto.consValue}
              options={dropdownValues.category || []}
              onChange={handleCategoryChange}
              isMandatory={true}
              isSubmitted={isSubmitted}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />

            <FormField
              type="text"
              label="Code"
              name="conCode"
              ControlID="txtCode"
              value={contactList.contactMastDto.conCode}
              onChange={handleInputChange}
              isSubmitted={isSubmitted}
              isMandatory={true}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />

            <FormField
              type="select"
              label="Department"
              name="deptID"
              ControlID="Department"
              value={contactList.contactMastDto.deptID === 0 ? "" : String(contactList.contactMastDto.deptID)}
              options={dropdownValues.department || []}
              onChange={handleDropdownChange(["contactMastDto", "deptID"], ["contactMastDto", "deptName"], dropdownValues.department || [])}
              isMandatory={true}
              isSubmitted={isSubmitted}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            {contactList.contactMastDto.consValue === "PHY" && (
              <FormField
                type="multiselect"
                label="Speciality"
                name="specialities"
                ControlID="specialities"
                value={selectedSpecialities}
                options={dropdownValues.speciality || []}
                onChange={handleSpecialityChange}
                isMandatory={contactList.contactMastDto.consValue === "PHY"}
                isSubmitted={isSubmitted}
              />
            )}
          </Grid>
        </section>
        <section>
          <Typography variant="h6" sx={{ borderBottom: "1px solid #000" }}>
            Personal Details
          </Typography>
          <Grid container spacing={2} alignItems="flex-start">
            <FormField
              type="select"
              label="Title"
              name="conTitle"
              ControlID="Title"
              value={contactList.contactMastDto.conTitle}
              options={dropdownValues.title || []}
              onChange={handleDropdownChange([""], ["contactMastDto", "conTitle"], dropdownValues.title || [])}
              isMandatory={true}
              isSubmitted={isSubmitted}
              disabled={contactList.contactMastDto.consValue === "PHY"}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <FormField
              type="text"
              label="First Name"
              name="conFName"
              ControlID="txtFName"
              value={contactList.contactMastDto.conFName}
              onChange={handleInputChange}
              isSubmitted={isSubmitted}
              isMandatory={true}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <FormField
              type="text"
              label="Last Name"
              name="conLName"
              ControlID="txtLName"
              value={contactList.contactMastDto.conLName}
              onChange={handleInputChange}
              isSubmitted={isSubmitted}
              isMandatory={true}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <FormField
              type="select"
              label="Gender"
              name="conGender"
              ControlID="Gender"
              value={contactList.contactMastDto.conGender || ""}
              options={dropdownValues.gender || []}
              onChange={handleDropdownChange([""], ["contactMastDto", "conGender"], dropdownValues.gender || [])}
              isMandatory={true}
              isSubmitted={isSubmitted}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <FormField
              type="datepicker"
              label="Birth Date"
              name="conDob"
              ControlID="BirthDate"
              value={contactList.contactMastDto.conDob}
              onChange={handleDateChange}
              isSubmitted={isSubmitted}
              maxDate={serverDate}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <FormField
              type="select"
              label="Blood Group"
              name="conBldGrp"
              ControlID="BloodGroup"
              value={contactList.contactMastDto.conBldGrp || ""}
              options={dropdownValues.bloodGroup || []}
              onChange={handleDropdownChange([""], ["contactMastDto", "conBldGrp"], dropdownValues.bloodGroup || [])}
              isSubmitted={isSubmitted}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <FormField
              type="select"
              label="Marital Status"
              name="maritalStatus"
              ControlID="MaritalStatus"
              value={contactList.contactMastDto.maritalStatus || ""}
              options={dropdownValues.maritalStatus || []}
              onChange={handleDropdownChange([""], ["contactMastDto", "maritalStatus"], dropdownValues.maritalStatus || [])}
              isSubmitted={isSubmitted}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />

            <FormField
              type="text"
              label="ID/Passport No"
              name="conSSNID"
              ControlID="PassportNo"
              value={contactList.contactMastDto.conSSNID}
              onChange={handleInputChange}
              isSubmitted={isSubmitted}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <FormField
              type="text"
              label="Allergic to any Medicine"
              name="allergicToMedicine"
              ControlID="allergicToMedicine"
              value={contactList.contactMastDto.allergicToMedicine || ""}
              onChange={(e) =>
                setContactList((prev) => ({
                  ...prev,
                  contactMastDto: {
                    ...prev.contactMastDto,
                    allergicToMedicine: e.target.value,
                  },
                }))
              }
              isSubmitted={isSubmitted}
              gridProps={{ xs: 12, sm: 12, md: 3 }}
              maxLength={50}
            />
            <FormField
              type="select"
              label="Room No"
              name="aPhyRoomName"
              ControlID="aPhyRoomName"
              value={contactList.contactMastDto.aPhyRoomName || ""}
              options={dropdownValues.employeeRoom || []}
              onChange={handleDropdownChange([""], ["contactMastDto", "aPhyRoomName"], dropdownValues.employeeRoom || [])}
              isSubmitted={isSubmitted}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
              onAddClick={() => handleAddField("EMPROOM")}
              showAddButton={true}
            />
          </Grid>
        </section>
        <section>
          <Typography variant="h6" sx={{ borderBottom: "1px solid #000" }}>
            Contact Details
          </Typography>
          <Grid container spacing={2} alignItems="flex-start">
            <FormField
              type="text"
              label="Mobile No"
              name="cAddPhone1"
              ControlID="txtMobileNo"
              value={contactList.contactAddressDto.cAddPhone1}
              onChange={handleInputChange}
              isSubmitted={isSubmitted}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <FormField
              type="select"
              label="City"
              name="cAddCity"
              ControlID="City"
              value={contactList.contactAddressDto.cAddCity || defaultFields.city}
              options={dropdownValues.city || []}
              onChange={handleDropdownChange([""], ["contactAddressDto", "cAddCity"], dropdownValues.city || [])}
              isSubmitted={isSubmitted}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
              showAddButton={true}
              onAddClick={() => handleAddField("CITY")}
            />
            <FormField
              type="select"
              label="State"
              name="cAddState"
              ControlID="State"
              value={contactList.contactAddressDto.cAddState || defaultFields.state}
              options={dropdownValues.state || []}
              onChange={handleDropdownChange([""], ["contactAddressDto", "cAddState"], dropdownValues.state || [])}
              isSubmitted={isSubmitted}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
              showAddButton={true}
              onAddClick={() => handleAddField("STATE")}
            />
            <FormField
              type="select"
              label="Nationality"
              name="cAddCountry"
              ControlID="Nationality"
              value={contactList.contactAddressDto.cAddCountry || defaultFields.nationality}
              options={dropdownValues.nationality || []}
              onChange={handleDropdownChange([""], ["contactAddressDto", "cAddCountry"], dropdownValues.nationality || [])}
              isSubmitted={isSubmitted}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
              showAddButton={true}
              onAddClick={() => handleAddField("NATIONALITY")}
            />
            <FormField
              type="email"
              label="E-Mail ID"
              name="cAddEmail"
              ControlID="MailID"
              value={contactList.contactAddressDto.cAddEmail}
              onChange={handleInputChange}
              isSubmitted={isSubmitted}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <FormField
              type="text"
              label="Post Code"
              name="cAddPostCode"
              ControlID="PostCode"
              value={contactList.contactAddressDto.cAddPostCode}
              onChange={handleInputChange}
              isSubmitted={isSubmitted}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <FormField
              type="text"
              label="Emergency Contact Name"
              name="emergenContactName"
              ControlID="EmergencyContactName"
              value={contactList.contactMastDto.emergenContactName}
              onChange={handleInputChange}
              isSubmitted={isSubmitted}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <FormField
              type="text"
              label="Emergency Contact No"
              name="cAddPhone2"
              ControlID="EmergencyContactNo"
              value={contactList.contactAddressDto.cAddPhone2}
              onChange={handleInputChange}
              isSubmitted={isSubmitted}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <FormField
              type="textarea"
              label="Address"
              name="cAddStreet"
              ControlID="Address"
              value={contactList.contactAddressDto.cAddStreet || ""}
              onChange={(e) =>
                setContactList((prev) => ({
                  ...prev,
                  contactAddressDto: {
                    ...prev.contactAddressDto,
                    cAddStreet: e.target.value,
                  },
                }))
              }
              isSubmitted={isSubmitted}
              gridProps={{ xs: 12, sm: 12, md: 3 }}
              maxLength={300}
            />
          </Grid>
        </section>
        <section>
          <Typography variant="h6" sx={{ borderBottom: "1px solid #000" }}>
            Account Details
          </Typography>
          <Grid container spacing={2} alignItems="flex-start">
            <FormField
              type="text"
              label="Account Code"
              name="accCode"
              ControlID="AccountCode"
              value={contactList.contactMastDto.accCode}
              onChange={handleInputChange}
              isSubmitted={isSubmitted}
              isMandatory={contactList.contactMastDto.consValue === "PHY"}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <FormField
              type="text"
              label="Account Pay Code"
              name="accPayCode"
              ControlID="AccountPayCode"
              value={contactList.contactMastDto.accPayCode}
              onChange={handleInputChange}
              isSubmitted={isSubmitted}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <FormField
              type="select"
              label="Employee Status"
              name="conEmpStatus"
              ControlID="EmployeeStatus"
              value={contactList.contactMastDto.conEmpStatus || ""}
              options={dropdownValues.employeeStatus || []}
              onChange={handleDropdownChange([""], ["contactMastDto", "employeeStatus"], dropdownValues.employeeStatus || [])}
              isSubmitted={isSubmitted}
              gridProps={{ xs: 12, sm: 6, md: 3 }}
            />
            <ModifiedFieldDialog
              open={isFieldDialogOpen}
              onClose={handleFieldDialogClose}
              selectedCategoryCode={dialogCategory}
              isFieldCodeDisabled={true}
              onFieldAddedOrUpdated={onFieldAddedOrUpdated}
            />
          </Grid>
        </section>
      </>
    ),
    [contactList, handleDropdownChange, handleInputChange, handleSpecialityChange, isSubmitted, selectedSpecialities]
  );

  return (
    <>
      {renderFormFields}
      <ContactListSwitches switchStates={switchStates} handleSwitchChange={handleSwitchChange} contactList={contactList} />
      <ContactListActions handleSave={handleSave} handleClear={handleClear} />
    </>
  );
});

export default React.memo(ContactListForm);
