import React, { useState } from "react";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import SmartForm from "../../../../components/SmartFormComponent/SmartForm";

const formFields = [
  {
    fieldName: "appointmentDate",
    label: "Appointment Date",
    controlType: "Date",
    //validation: Yup.date().required("Appointment Date is required"),
    defaultValue: "",
    isVisible: true,
  },
  {
    fieldName: "doctorName",
    label: "Doctor Name",
    controlType: "Textbox",
    // validation: Yup.string().required("Doctor Name is required"),
    defaultValue: "",
    isVisible: true,
  },
  {
    fieldName: "department",
    label: "Department",
    controlType: "Dropdown",
    // validation: Yup.string().required("Department is required"),
    defaultValue: "",
    isVisible: true,
    listData: {
      valueField: "value",
      textField: "label",
      defaultSelectedText: "Select Department",
    },
  },
  {
    fieldName: "patientName",
    label: "Patient Name",
    controlType: "Textbox",
    // validation: Yup.string().required("Patient Name is required"),
    defaultValue: "",
    isVisible: true,
  },
  // Add more fields as needed
];

const departmentOptions = [
  { value: "cardiology", label: "Cardiology" },
  { value: "neurology", label: "Neurology" },
  { value: "orthopedics", label: "Orthopedics" },
];

const AppointmentPage1: React.FC = () => {
  const [formData, setFormData] = useState({});

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
    <MainLayout>
      <div style={{ padding: "2rem" }}>
        <h1>Book an Appointment</h1>
        <SmartForm
          formName="Appointment Booking"
          // formField={formFields}
          listData={{ department: departmentOptions }}
          showLoader={false}
          showBreadCrumbs={false}
          initSaveBtnText="Book Appointment"
          onSubmit={handleFormSubmit}
          onChange={handleFieldChange}
          onDropdownAddButtonClick={handleDropdownAddButtonClick} formField={[]} />
      </div>
    </MainLayout>
  );
};

export default AppointmentPage1;
