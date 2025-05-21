// useReportsData.ts - Adjusted to use useLoading
import { useLoading } from "@/hooks/Common/useLoading";
import { useEffect, useState } from "react";

const useReportsData = <T>(fetchFunction: (auGrpID: number) => Promise<T[]>, auGrpID: number) => {
  const { setLoading } = useLoading();
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true); // Start loading
    fetchFunction(auGrpID)
      .then((response) => {
        setData(response);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(err);
      })
      .finally(() => {
        setLoading(false); // Stop loading
      });
  }, [fetchFunction, auGrpID]);

  return { data, error };
};

export default useReportsData;
