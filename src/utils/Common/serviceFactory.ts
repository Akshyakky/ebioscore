//src/utils/Common/serviceFactory.ts

import { APIConfig } from "@/apiConfig";
import { CommonApiService } from "@/services/CommonApiService";
import { BaseDto, GenericEntityService } from "@/services/GenericEntityService/GenericEntityService";

export function createEntityService<T extends BaseDto>(entityName: string, apiKey: string | keyof typeof APIConfig): GenericEntityService<T> {
  const validKey = apiKey in APIConfig ? (apiKey as keyof typeof APIConfig) : "commonURL";
  return new GenericEntityService<T>(
    new CommonApiService({
      baseURL: APIConfig[validKey],
    }),
    entityName
  );
}
