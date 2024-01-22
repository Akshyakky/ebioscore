// hooks/useDropdown.ts
import { useState, useEffect } from "react";

// Assuming DropdownOption is already defined somewhere in your project
interface DropdownOption {
  value: string | number;
  label: string;
}

// Assuming that the serviceFunction returns a promise of an array of data items
// and that transformData is a function that takes the service function's return type
// and converts it to an array of DropdownOption
const useDropdown = (
  serviceFunction: (...args: any[]) => Promise<any[]>,
  transformData: (data: any[]) => DropdownOption[],
  params: any[]
) => {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      try {
        const response = await serviceFunction(...params);
        setOptions(transformData(response));
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error fetching data"));
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [serviceFunction, transformData, params]);

  return { options, loading, error };
};

export default useDropdown;
