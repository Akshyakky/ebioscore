import { DropdownOption } from "../interfaces/common/DropdownOption";
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
    (e: SelectChangeEvent<string>, child?: React.ReactNode) => {
      debugger;
      const selectedValue = e.target.value;
      const selectedOption = options.find(
        (option) =>
          String(option.value) === String(selectedValue) ||
          option.label === selectedValue
      );

      setFormData((prevFormData) => {
        let newData = { ...prevFormData } as any;

        // Function to safely navigate through nested properties
        const navigateAndSet = (path: (string | number)[], value: any) => {
          let current = newData;
          for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
              current[path[i]] = {};
            }
            current = current[path[i]];
          }
          current[path[path.length - 1]] = value;
        };

        // Update value if valuePath is provided
        if (valuePath.length > 0) {
          navigateAndSet(
            valuePath,
            selectedOption ? selectedOption.value : selectedValue
          );
        }

        // Update text if textPath is provided and selectedOption exists
        if (textPath.length > 0 && selectedOption) {
          navigateAndSet(textPath, selectedOption.label);
        }

        return newData;
      });
    };

  return { handleDropdownChange };
};

export default useDropdownChange;
