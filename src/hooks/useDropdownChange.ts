import { SelectChangeEvent } from "@mui/material";
import { DropdownOption } from "../interfaces/Common/DropdownOption";

const useDropdownChange = <T extends object>(setFormData: React.Dispatch<React.SetStateAction<T>>) => {
  const handleDropdownChange =
    (valuePath: (string | number)[], textPath: (string | number)[], options: DropdownOption[]) => (e: SelectChangeEvent<string>, child?: React.ReactNode) => {
      const selectedValue = e.target.value;
      const selectedOption = options.find((option) => String(option.value) === String(selectedValue) || option.label === selectedValue);

      setFormData((prevFormData) => {
        let newData = { ...prevFormData } as any;
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

        if (valuePath.length > 0) {
          navigateAndSet(valuePath, selectedOption ? selectedOption.value : selectedValue);
        }
        if (textPath.length > 0 && selectedOption) {
          navigateAndSet(textPath, selectedOption.label);
        }
        return newData;
      });
    };

  return { handleDropdownChange };
};

export default useDropdownChange;
