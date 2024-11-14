// useSearch.ts
import { useState, useMemo } from "react";

const useSearch = <T>(data: T[], searchFields: (keyof T)[]) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    return data.filter((item) => searchFields.some((field) => String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())));
  }, [data, searchTerm, searchFields]);

  return { searchTerm, setSearchTerm, filteredData };
};

export default useSearch;
