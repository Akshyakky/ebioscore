// src/hooks/useServerDate.ts
import { useState, useEffect } from "react";
import {
  fetchServerTime,
  ServerTimeResponse,
} from "../../services/CommonServices/serverTimeService";
import { OperationResult } from "../../interfaces/Common/OperationResult";

export const useServerDate = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    const initializeCurrentDate = async () => {
      const serverTimeResult: OperationResult<ServerTimeResponse> =
        await fetchServerTime();

      if (serverTimeResult.success && serverTimeResult.data) {
        try {
          const serverUtcDate = new Date(serverTimeResult.data.serverLocalTime);
          if (isNaN(serverUtcDate.getTime())) {
            throw new Error("Invalid Date");
          }
          setCurrentDate(serverUtcDate);
        } catch (error) {
          console.error(
            "Failed to parse server time, using local time:",
            error
          );
          setCurrentDate(new Date());
        }
      } else {
        console.error(
          "Failed to fetch server time:",
          serverTimeResult.errorMessage
        );
        setCurrentDate(new Date());
      }
    };

    initializeCurrentDate();
  }, []);

  return currentDate;
};
