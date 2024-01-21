import { DropdownOption } from "../interfaces/Common/DropdownOption";
import { SelectChangeEvent } from "@mui/material";

const useDropdownChange = <T extends object>(
  setFormData: React.Dispatch<React.SetStateAction<T>>
) => {
  const handleDropdownChange =
    (
      valuePath: (string | number)[],
      textPath: (string | number)[],
      options: DropdownOption[]
    ) =>
    (e: SelectChangeEvent<unknown>, child?: React.ReactNode) => {
      const selectedValue = e.target.value;
      const selectedOption = options.find(
        (option) => String(option.value) === String(selectedValue)
      );
      setFormData((prevFormData) => {
        let newData = { ...prevFormData } as any;

        // Update value if valuePath is provided
        if (valuePath.length > 0) {
          let current = newData;
          for (let i = 0; i < valuePath.length - 1; i++) {
            current = current[valuePath[i]];
          }
          current[valuePath[valuePath.length - 1]] = selectedValue;
        }

        // Update text if textPath is provided and selectedOption is found
        if (textPath.length > 0 && selectedOption) {
          let current = newData;
          for (let i = 0; i < textPath.length - 1; i++) {
            current = current[textPath[i]];
          }
          current[textPath[textPath.length - 1]] = selectedOption.label;
        }

        return newData;
      });
    };

  return { handleDropdownChange };
};
export default useDropdownChange;
