import { Dispatch, SetStateAction } from "react";

const useRadioButtonChange = <T extends object>(
  setFormData: Dispatch<SetStateAction<T>>
) => {
  const handleRadioButtonChange = (path: string | (string | number)[]) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const pathArray = Array.isArray(path) ? path : [path];

    setFormData(prevFormData => {
      let newData: any = { ...prevFormData };
      let current: any = newData;

      for (let i = 0; i < pathArray.length - 1; i++) {
        const key = pathArray[i];
        if (!(key in current)) {
          current[key] = typeof pathArray[i + 1] === 'number' ? [] : {};
        }
        current = current[key];
      }

      current[pathArray[pathArray.length - 1]] = e.target.value;

      return newData as T;
    });
  };

  return { handleRadioButtonChange };
};


export default useRadioButtonChange;
