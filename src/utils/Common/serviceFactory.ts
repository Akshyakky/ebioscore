//src/utils/Common/serviceFactory.ts

import { APIConfig } from "@/apiConfig";
import { CommonApiService } from "@/services/CommonApiService";
import { BaseDto, GenericEntityService } from "@/services/GenericEntityService/GenericEntityService";

export function createEntityService<T extends BaseDto>(entityName: string, apiKey: keyof typeof APIConfig): GenericEntityService<T> {
  return new GenericEntityService<T>(
    new CommonApiService({
      baseURL: APIConfig[apiKey],
    }),
    entityName
  );
}
