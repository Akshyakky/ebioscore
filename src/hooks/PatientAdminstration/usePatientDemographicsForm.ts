import { useState } from "react";

// Define the shape of your form data. This is an example; adjust it according to your actual form data structure.
interface FormData {
  [key: string]: any; // Use a more specific type if possible for better type safety
}

// Define the shape of your validation errors object
interface FormErrors {
  [key: string]: string;
}

// Define the type for the validation function
type ValidateFunction = (formData: FormData) => FormErrors;

// Define the type for the callback function (what to do when form submission is successful)
type CallbackFunction = () => Promise<void>;

export const usePatientDemographicsForm = (
  initialState: FormData,
  validate: ValidateFunction
) => {
  const [formData, setFormData] = useState<FormData>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (callback: CallbackFunction) => {
    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      await callback(); // perform save operation
    }
  };

  return { formData, handleChange, handleSubmit, errors };
};
