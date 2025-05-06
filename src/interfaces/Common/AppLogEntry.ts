export interface AppLogEntry {
  logId: number;
  timestamp: Date;
  level: string;
  message: string;
  exception?: string;
  logUser?: string;
  logUserId?: string;
  source?: string;
  eventId?: string;
  threadId: number;
  user?: string;
  userId?: string;
  context?: string;
  hostname?: string;
  applicationName?: string;
  requestPath?: string;
  requestMethod?: string;
  clientIp?: string;
  correlationId?: string;
  structuredProperties: Record<string, any>;
  companyId?: string;
  companyCode?: string;
}
