// src/hooks/useServerDate.ts
import { useState, useEffect } from "react";
import { fetchServerTime, ServerTimeResponse } from "../../services/CommonServices/serverTimeService";

export const useServerDate = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    const initializeCurrentDate = async () => {
      try {
        // Get the result from the API call
        const result = await fetchServerTime();

        // Use type assertion to align with actual response structure
        const serverTimeResult = result as unknown as ServerTimeResponse;

        if (serverTimeResult && serverTimeResult.serverLocalTime) {
          const serverUtcDate = new Date(serverTimeResult.serverLocalTime);
          if (isNaN(serverUtcDate.getTime())) {
            throw new Error("Invalid Date");
          }
          setCurrentDate(serverUtcDate);
        } else {
          throw new Error("Missing server time data");
        }
      } catch (error) {
        console.error("Failed to get valid server time, using local time:", error);
        setCurrentDate(new Date());
      }
    };

    initializeCurrentDate();
  }, []);

  return currentDate;
};
