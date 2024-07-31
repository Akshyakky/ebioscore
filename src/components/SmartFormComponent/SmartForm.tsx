import React, { useEffect, useCallback } from "react";
import { Formik, Form, Field, ErrorMessage, useFormik } from "formik";
import * as Yup from "yup";
import {
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
} from "@mui/material";
import FloatingLabelTextBox from "../TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import DropdownSelect from "../DropDown/DropdownSelect";

interface FormField {
  fieldName: string;
  label: string;
  controlType: string;
  validation: any;
  defaultValue: any;
  isVisible: boolean;
  sectionName?: string;
  showDropdownAddButton?: boolean;
  listData?: {
    fetchURL?: string;
    requestBody?: any;
    valueField: string;
    textField: string;
    defaultSelectedText?: string;
  };
}

interface SmartFormProps {
  formName?: string;
  formField: FormField[];
  manuallyClearField?: boolean;
  listData?: any;
  searchFormName?: string;
  showLoader?: boolean;
  showDefaultListTable?: boolean;
  editData?: any;
  showBackButton?: boolean;
  showBreadCrumbs?: boolean;
  initSaveBtnText?: string;
  additionalValidation?: boolean;
  onSubmit: (values: any) => void;
  onChange?: (field: FormField, value: any) => void;
  onDropdownAddButtonClick?: (field: FormField) => void;
}

const SmartForm: React.FC<SmartFormProps> = ({
  formName,
  formField,
  manuallyClearField = false,
  listData,
  searchFormName,
  showLoader = false,
  showDefaultListTable = true,
  editData,
  showBackButton = true,
  showBreadCrumbs = true,
  initSaveBtnText = "Save",
  additionalValidation = false,
  onSubmit,
  onChange,
  onDropdownAddButtonClick,
}) => {
  const initialValues = formField.reduce((acc, field) => {
    acc[field.fieldName] = field.defaultValue || "";
    return acc;
  }, {} as any);

  const validationSchema = Yup.object(
    formField.reduce((acc, field) => {
      if (field.validation) {
        acc[field.fieldName] = field.validation;
      }
      return acc;
    }, {} as any)
  );

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  useEffect(() => {
    if (manuallyClearField) {
      formik.resetForm();
    }
    if (editData) {
      formik.setValues(editData);
    }
  }, [manuallyClearField, editData]);

  const handleFieldChange = useCallback(
    (field: FormField, value: any) => {
      if (onChange) {
        onChange(field, value);
      }
    },
    [onChange]
  );

  const getErrorMessage = (fieldName: string) => {
    const error = formik.errors[fieldName];
    return typeof error === "string" ? error : undefined;
  };

  return (
    <div>
      {showBreadCrumbs && (
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <button onClick={() => window.history.back()}>Back</button>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {formName}
            </li>
          </ol>
        </nav>
      )}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={formik.handleSubmit}
      >
        {({ values, handleChange }) => (
          <Form>
            {formField.map((field) => (
              <div key={field.fieldName} className="mb-3">
                {field.isVisible && (
                  <>
                    {field.sectionName && (
                      <>
                        <h6>{field.sectionName}</h6>
                        <hr />
                      </>
                    )}
                    <FormControl fullWidth margin="normal">
                      {field.controlType === "Textbox" && (
                        <FloatingLabelTextBox
                          ControlID={field.fieldName}
                          title={field.label}
                          value={values[field.fieldName]}
                          onChange={(e) => {
                            handleChange(e);
                            handleFieldChange(field, e.target.value);
                          }}
                          isMandatory={field.validation?.tests.some(
                            (test: any) => test.OPTIONS.name === "required"
                          )}
                          errorMessage={getErrorMessage(field.fieldName)}
                        />
                      )}
                      {field.controlType === "Password" && (
                        <FloatingLabelTextBox
                          ControlID={field.fieldName}
                          title={field.label}
                          type="password"
                          value={values[field.fieldName]}
                          onChange={(e) => {
                            handleChange(e);
                            handleFieldChange(field, e.target.value);
                          }}
                          isMandatory={field.validation?.tests.some(
                            (test: any) => test.OPTIONS.name === "required"
                          )}
                          errorMessage={getErrorMessage(field.fieldName)}
                        />
                      )}
                      {field.controlType === "Date" && (
                        <FloatingLabelTextBox
                          ControlID={field.fieldName}
                          title={field.label}
                          type="date"
                          value={values[field.fieldName]}
                          onChange={(e) => {
                            handleChange(e);
                            handleFieldChange(field, e.target.value);
                          }}
                          isMandatory={field.validation?.tests.some(
                            (test: any) => test.OPTIONS.name === "required"
                          )}
                          errorMessage={getErrorMessage(field.fieldName)}
                        />
                      )}
                      {field.controlType === "Dropdown" && (
                        <DropdownSelect
                          label={field.label}
                          name={field.fieldName}
                          value={values[field.fieldName]}
                          options={listData?.[field.fieldName] || []}
                          onChange={(e) => {
                            handleChange(e);
                            handleFieldChange(
                              field,
                              (e.target as HTMLInputElement).value
                            );
                          }}
                          isMandatory={field.validation?.tests.some(
                            (test: any) => test.OPTIONS.name === "required"
                          )}
                          defaultText={field.listData?.defaultSelectedText}
                          clearable={field.showDropdownAddButton}
                          onClear={() => handleFieldChange(field, "")}
                        />
                      )}
                      <FormHelperText>
                        <ErrorMessage name={field.fieldName} />
                      </FormHelperText>
                    </FormControl>
                    {field.showDropdownAddButton && (
                      <Button
                        type="button"
                        onClick={() =>
                          onDropdownAddButtonClick &&
                          onDropdownAddButtonClick(field)
                        }
                      >
                        Add
                      </Button>
                    )}
                  </>
                )}
              </div>
            ))}
            <div className="d-flex justify-content-between">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={showLoader || additionalValidation}
              >
                {showLoader ? (
                  <>
                    <CircularProgress size={20} />
                    Loading...
                  </>
                ) : (
                  initSaveBtnText
                )}
              </Button>
              <Button
                type="button"
                variant="outlined"
                color="secondary"
                onClick={() => formik.resetForm()}
              >
                Clear
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SmartForm;
