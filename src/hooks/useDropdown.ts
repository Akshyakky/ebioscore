import { useState, useEffect, useCallback, useMemo } from "react";
import { DropdownOption } from "../interfaces/Common/DropdownOption";

const useDropdown = (
  serviceFunction: (...args: any[]) => Promise<any[]>,
  transformData: (data: any[]) => DropdownOption[],
  params: any[]
) => {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const memoizedServiceFunction = useCallback(serviceFunction, []);
  const memoizedTransformData = useCallback(transformData, []);
  const memoizedParams = useMemo(() => params, [params]);

  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      try {
        const response = await memoizedServiceFunction(...memoizedParams);
        setOptions(memoizedTransformData(response));
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error fetching data"));
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [memoizedServiceFunction, memoizedTransformData, memoizedParams]);

  return { options, loading, error };
};

export default useDropdown;
