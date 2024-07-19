import React from "react";
import * as Yup from "yup";
import SmartForm from "./SmartForm"; // Import the SmartForm component

const formFields = [
  {
    fieldName: "username",
    label: "Username",
    controlType: "Textbox",
    validation: Yup.string().required("Username is required"),
    defaultValue: "",
    isVisible: true,
  },
  {
    fieldName: "password",
    label: "Password",
    controlType: "Password",
    validation: Yup.string().required("Password is required"),
    defaultValue: "",
    isVisible: true,
  },
  {
    fieldName: "dob",
    label: "Date of Birth",
    controlType: "Date",
    validation: Yup.date().required("Date of Birth is required"),
    defaultValue: "",
    isVisible: true,
  },
  {
    fieldName: "gender",
    label: "Gender",
    controlType: "Dropdown",
    validation: Yup.string().required("Gender is required"),
    defaultValue: "",
    isVisible: true,
    listData: {
      valueField: "value",
      textField: "label",
      defaultSelectedText: "Select Gender",
    },
  },
  // Add more fields as needed
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const App: React.FC = () => {
  const handleFormSubmit = (values: any) => {
    console.log("Form Data:", values);
  };

  const handleFieldChange = (field: any, value: any) => {
    console.log(`Field changed: ${field.fieldName}, Value: ${value}`);
  };

  const handleDropdownAddButtonClick = (field: any) => {
    console.log(`Dropdown add button clicked for field: ${field.fieldName}`);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dynamic Form Example</h1>
      <SmartForm
        formName="User Registration"
        formField={formFields}
        listData={{ gender: genderOptions }}
        showLoader={false}
        showBreadCrumbs={false}
        initSaveBtnText="Register"
        onSubmit={handleFormSubmit}
        onChange={handleFieldChange}
        onDropdownAddButtonClick={handleDropdownAddButtonClick}
      />
    </div>
  );
};

export default App;
