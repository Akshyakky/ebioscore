import React, { useEffect, useState } from "react";
import { Grid, SelectChangeEvent, Typography } from "@mui/material";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import MultiSelectDropdown from "../../../../components/DropDown/MultiSelectDropdown";
import TextArea from "../../../../components/TextArea/TextArea";
import { ContactListData } from "../../../../interfaces/HospitalAdministration/ContactListData";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import ContactListActions from "./ContactListActions";
import ContactListSwitches from "./ContactListSwitches";
import { ContactListService } from "../../../../services/HospitalAdministrationServices/ContactListService/ContactListService";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { showAlert } from "../../../../utils/Common/showAlert";

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
    dropdownValues: {
        titleOptions: DropdownOption[];
        genderOptions: DropdownOption[];
        bloodGroupOptions: DropdownOption[];
        maritalStatusOptions: DropdownOption[];
        cityOptions: DropdownOption[];
        stateOptions: DropdownOption[];
        nationalityOptions: DropdownOption[];
        categoryOptions: DropdownOption[];
        departmentOptions: DropdownOption[];
        employeeStatusOptions: DropdownOption[];
        specialityOptions: DropdownOption[];
    };
    contactList: ContactListData;
    setContactList: React.Dispatch<React.SetStateAction<ContactListData>>;
    switchStates: SwitchStates;
    setSwitchStates: React.Dispatch<React.SetStateAction<SwitchStates>>;
}

const ContactListForm: React.FC<ContactListFormProps> = ({
    dropdownValues,
    contactList,
    setContactList,
    switchStates,
    setSwitchStates,
}) => {
    const { token, compID, userID, userName, compCode, compName } = useSelector(
        (state: RootState) => state.userDetails
    );
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { handleDropdownChange } = useDropdownChange<ContactListData>(setContactList);
    const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>([]);

    const handleSpecialityChange = (event: SelectChangeEvent<unknown>) => {
        const target = event.target as HTMLInputElement;
        const value = target.value;
        const updatedSpecialities = typeof value === "string" ? value.split(",") : (value as string[]);

        // Update selected specialities state
        setSelectedSpecialities(updatedSpecialities);

        // Update contact list state
        setContactList((prev) => ({
            ...prev,
            contactDetailsDto: updatedSpecialities.map((val) => ({
                facID: parseInt(val),
                facName: dropdownValues.specialityOptions.find((opt) => opt.value === val)?.label || "",
                compID: compID!,
                compCode: compCode!,
                compName: compName!,
                transferYN: "N",
                cdID: 0,
                conID: prev.contactMastDto.conID,
                conType: ""
            })),
        }));
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setContactList((prev) => {
            if (name === "conCode") {
                return {
                    ...prev,
                    contactMastDto: {
                        ...prev.contactMastDto,
                        conCode: value,
                    },
                    contactAddressDto: {
                        ...prev.contactAddressDto,
                        conCode: value,
                    },
                };
            }
            // Check if the field belongs to contactAddressDto
            if (name in prev.contactAddressDto) {
                return {
                    ...prev,
                    contactAddressDto: {
                        ...prev.contactAddressDto,
                        [name]: value,
                    },
                };
            }
            // Otherwise, update contactMastDto
            return {
                ...prev,
                contactMastDto: {
                    ...prev.contactMastDto,
                    [name]: value,
                },
            };
        });
    };

    const handleSwitchChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const checkedValue = event.target.checked ? "Y" : "N";
        setSwitchStates((prev) => ({
            ...prev,
            [name]: event.target.checked,
        }));
        setContactList((prev) => ({
            ...prev,
            contactMastDto: {
                ...prev.contactMastDto,
                [`${name}YN`]: checkedValue,
            },
            contactAddressDto:
                name === "isEmployee" || name === "isAuthorisedUser"
                    ? {
                        ...prev.contactAddressDto,
                        [`${name}YN`]: checkedValue,
                    }
                    : prev.contactAddressDto,
        }));
    };

    const handleSave = async () => {
        setIsSubmitted(true);
        try {
            const result = await ContactListService.saveContactList(token!, contactList);
            if (result.success) {
                showAlert('Notification', 'Contact list saved successfully', 'success', {
                    onConfirm: handleClear,
                });
            } else {
                showAlert('Error', result.errorMessage || 'Failed to save contact list.', 'error');
            }
        } catch (error) {
            showAlert('Error', 'An unexpected error occurred while saving the contact list.', 'error');
        }
    };

    const handleClear = () => {
        setContactList(
            getInitialContactListState(userID!, userName!, compID!, compCode!, compName!)
        );
        setSwitchStates({
            isEmployee: false,
            isReferral: false,
            isAppointment: false,
            isSuperSpeciality: false,
            isUserRequired: false,
            isAuthorisedUser: false,
            isContract: false,
        });
        //setSelectedSpecialities([]);
        setIsSubmitted(false);
    };

    return (
        <>
            <section>
                <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} sm={6} md={3}>
                        <FloatingLabelTextBox
                            title="Code"
                            ControlID="txtCode"
                            placeholder="Code"
                            type="text"
                            size="small"
                            name="conCode"
                            value={contactList.contactMastDto.conCode}
                            isSubmitted={isSubmitted}
                            onChange={handleInputChange}
                            isMandatory
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <DropdownSelect
                            name="conCat"
                            label="Category"
                            value={contactList.contactMastDto.consValue}
                            options={dropdownValues.categoryOptions}
                            onChange={handleDropdownChange(
                                ["contactMastDto", "consValue"],
                                ["contactMastDto", "conCat"],
                                dropdownValues.categoryOptions
                            )}
                            isMandatory
                            size="small"
                            isSubmitted={isSubmitted}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <DropdownSelect
                            name="deptID"
                            label="Department"
                            value={
                                contactList.contactMastDto.deptID === 0
                                    ? ""
                                    : String(contactList.contactMastDto.deptID)
                            }
                            options={dropdownValues.departmentOptions}
                            onChange={handleDropdownChange(
                                ["contactMastDto", "deptID"],
                                ["contactMastDto", "deptName"],
                                dropdownValues.departmentOptions
                            )}
                            isMandatory
                            size="small"
                            isSubmitted={isSubmitted}
                        />
                    </Grid>
                    {contactList.contactMastDto.consValue === "PHY" && (
                        <Grid item xs={12} sm={6} md={3}>
                            <MultiSelectDropdown
                                label="Speciality"
                                name="selectedSpecialities"
                                value={selectedSpecialities}
                                options={dropdownValues.specialityOptions.map(option => ({
                                    value: option.value,
                                    label: option.label
                                }))}
                                onChange={handleSpecialityChange}
                                defaultText="Select Specialities"
                                size="small"
                                multiple={true}
                                isMandatory
                                isSubmitted={isSubmitted}
                            />


                        </Grid>
                    )}
                </Grid>
            </section>
            <section>
                <Typography variant="h6" sx={{ borderBottom: "1px solid #000" }}>
                    Personal Details
                </Typography>
                <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} sm={6} md={3}>
                        <DropdownSelect
                            name="conTitle"
                            label="Title"
                            value={contactList.contactMastDto.conTitle}
                            options={dropdownValues.titleOptions}
                            onChange={handleDropdownChange(
                                [""],
                                ["contactMastDto", "conTitle"],
                                dropdownValues.titleOptions
                            )}
                            isMandatory
                            size="small"
                            isSubmitted={isSubmitted}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FloatingLabelTextBox
                            title="First Name"
                            ControlID="txtFName"
                            placeholder="First Name"
                            type="text"
                            name="conFName"
                            size="small"
                            value={contactList.contactMastDto.conFName}
                            isSubmitted={isSubmitted}
                            onChange={handleInputChange}
                            isMandatory
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FloatingLabelTextBox
                            title="Last Name"
                            ControlID="txtLName"
                            placeholder="Last Name"
                            type="text"
                            name="conLName"
                            size="small"
                            value={contactList.contactMastDto.conLName}
                            isSubmitted={isSubmitted}
                            onChange={handleInputChange}
                            isMandatory
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <DropdownSelect
                            name="conGender"
                            label="Gender"
                            value={contactList.contactMastDto.conGender || ""}
                            options={dropdownValues.genderOptions}
                            onChange={handleDropdownChange(
                                [""],
                                ["contactMastDto", "conGender"],
                                dropdownValues.genderOptions
                            )}
                            isMandatory
                            size="small"
                            isSubmitted={isSubmitted}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} sm={6} md={3}>
                        <FloatingLabelTextBox
                            title="Birth Date"
                            ControlID="BirthDate"
                            placeholder="dd/mm/yyyy"
                            type="date"
                            name="conDob"
                            size="small"
                            value={
                                contactList.contactMastDto.conDob
                                    ? contactList.contactMastDto.conDob.toString().split("T")[0]
                                    : ""
                            }
                            isSubmitted={isSubmitted}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <DropdownSelect
                            name="conBldGrp"
                            label="Blood Group"
                            value={contactList.contactMastDto.conBldGrp || ""}
                            options={dropdownValues.bloodGroupOptions}
                            onChange={handleDropdownChange(
                                [""],
                                ["contactMastDto", "conBldGrp"],
                                dropdownValues.bloodGroupOptions
                            )}
                            size="small"
                            isSubmitted={isSubmitted}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <DropdownSelect
                            name="maritalStatus"
                            label="Marital Status"
                            value={contactList.contactMastDto.maritalStatus || ""}
                            options={dropdownValues.maritalStatusOptions}
                            onChange={handleDropdownChange(
                                [""],
                                ["contactMastDto", "maritalStatus"],
                                dropdownValues.maritalStatusOptions
                            )}
                            size="small"
                            isSubmitted={isSubmitted}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FloatingLabelTextBox
                            title="ID/Passport No"
                            ControlID="PassportNo"
                            placeholder="ID/Passport No"
                            type="text"
                            name="conSSNID"
                            size="small"
                            value={contactList.contactMastDto.conSSNID}
                            isSubmitted={isSubmitted}
                            onChange={handleInputChange}
                        />
                    </Grid>
                </Grid>
            </section>
            <section>
                <Typography variant="h6" sx={{ borderBottom: "1px solid #000" }}>
                    Contact Details
                </Typography>
                <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} sm={6} md={3}>
                        <FloatingLabelTextBox
                            title="Mobile No"
                            ControlID="txtMobileNo"
                            placeholder="Mobile No"
                            type="text"
                            name="cAddPhone1"
                            size="small"
                            value={contactList.contactAddressDto.cAddPhone1}
                            isSubmitted={isSubmitted}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <DropdownSelect
                            name="cAddCity"
                            label="City"
                            value={contactList.contactAddressDto.cAddCity || ""}
                            options={dropdownValues.cityOptions}
                            onChange={handleDropdownChange(
                                [""],
                                ["contactAddressDto", "cAddCity"],
                                dropdownValues.cityOptions
                            )}
                            size="small"
                            isSubmitted={isSubmitted}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <DropdownSelect
                            name="cAddState"
                            label="State"
                            value={contactList.contactAddressDto.cAddState || ""}
                            options={dropdownValues.stateOptions}
                            onChange={handleDropdownChange(
                                [""],
                                ["contactAddressDto", "cAddState"],
                                dropdownValues.stateOptions
                            )}
                            size="small"
                            isSubmitted={isSubmitted}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <DropdownSelect
                            name="cAddCountry"
                            label="Nationality"
                            value={contactList.contactAddressDto.cAddCountry || ""}
                            options={dropdownValues.nationalityOptions}
                            onChange={handleDropdownChange(
                                [""],
                                ["contactAddressDto", "cAddCountry"],
                                dropdownValues.nationalityOptions
                            )}
                            size="small"
                            isSubmitted={isSubmitted}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} sm={6} md={3}>
                        <FloatingLabelTextBox
                            title="E-Mail ID"
                            ControlID="MailID"
                            placeholder="E-Mail ID"
                            type="email"
                            name="cAddEmail"
                            size="small"
                            value={contactList.contactAddressDto.cAddEmail}
                            isSubmitted={isSubmitted}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FloatingLabelTextBox
                            title="Post Code"
                            ControlID="PostCode"
                            placeholder="Post Code"
                            type="text"
                            name="cAddPostCode"
                            size="small"
                            value={contactList.contactAddressDto.cAddPostCode}
                            isSubmitted={isSubmitted}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FloatingLabelTextBox
                            title="Emergency Contact Name"
                            ControlID="EmergencyContactName"
                            placeholder="Emergency Contact Name"
                            type="text"
                            name="emergenContactName"
                            size="small"
                            value={contactList.contactMastDto.emergenContactName}
                            isSubmitted={isSubmitted}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FloatingLabelTextBox
                            title="Emergency Contact No"
                            ControlID="EmergencyContactNo"
                            placeholder="Emergency Contact No"
                            type="text"
                            name="cAddPhone2"
                            size="small"
                            value={contactList.contactAddressDto.cAddPhone2}
                            isSubmitted={isSubmitted}
                            onChange={handleInputChange}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} sm={6} md={3}>
                        <TextArea
                            label="Address"
                            name="cAddStreet"
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
                            placeholder="Address"
                            rows={1}
                        />
                    </Grid>
                </Grid>
            </section>
            <section>
                <Typography variant="h6" sx={{ borderBottom: "1px solid #000" }}>
                    Account Details
                </Typography>
                <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} sm={6} md={3}>
                        <FloatingLabelTextBox
                            title="Account Code"
                            ControlID="AccountCode"
                            placeholder="Account Code"
                            type="text"
                            name="accCode"
                            size="small"
                            value={contactList.contactMastDto.accCode}
                            isSubmitted={isSubmitted}
                            onChange={handleInputChange}
                            isMandatory={contactList.contactMastDto.consValue === "PHY"} // Make Account Code mandatory if Category is PHY
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FloatingLabelTextBox
                            title="Account Pay Code"
                            ControlID="AccountPayCode"
                            placeholder="Account Pay Code"
                            type="text"
                            name="accPayCode"
                            size="small"
                            value={contactList.contactMastDto.accPayCode}
                            isSubmitted={isSubmitted}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <DropdownSelect
                            name="conEmpStatus"
                            label="Employee Status"
                            value={contactList.contactMastDto.conEmpStatus || ""}
                            options={dropdownValues.employeeStatusOptions}
                            onChange={handleDropdownChange(
                                [""],
                                ["contactMastDto", "conEmpStatus"],
                                dropdownValues.employeeStatusOptions
                            )}
                            size="small"
                            isSubmitted={isSubmitted}
                        />
                    </Grid>
                </Grid>
                <ContactListSwitches
                    switchStates={switchStates}
                    handleSwitchChange={handleSwitchChange}
                    contactList={contactList}
                />
            </section>
            <ContactListActions handleSave={handleSave} handleClear={handleClear} />
        </>
    );
};

export default ContactListForm;

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
