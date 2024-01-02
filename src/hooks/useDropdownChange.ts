// useDropdownChange.ts
import { useState } from "react";
import { DropdownOption } from "../interfaces/Common/DropdownOption";

type FormData = {
  [key: string]: any;
};

const useDropdownChange = (initialFormData: FormData) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleDropdownChange =
    (
      valuePath: (string | number)[],
      textPath: (string | number)[],
      options: DropdownOption[]
    ) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = e.target.value;
      const selectedOption = options.find(
        (option) => option.value === selectedValue
      );

      setFormData((prevFormData) => {
        const newData = updateState(prevFormData, valuePath, selectedValue);
        if (selectedOption) {
          return updateState(newData, textPath, selectedOption.label);
        }
        return newData;
      });
    };

  const updateState = (
    obj: FormData,
    path: (string | number)[],
    newValue: any
  ): FormData => {
    const [first, ...rest] = path as string[];
    if (rest.length === 0) {
      return { ...obj, [first]: newValue };
    } else {
      return {
        ...obj,
        [first]: updateState(obj[first] as FormData, rest, newValue),
      };
    }
  };

  return { formData, handleDropdownChange };
};

export default useDropdownChange;
