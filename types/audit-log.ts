export interface AuditLogData {
  app_type: string
  branch: string
  channels: string
  created_at: string
  created_by: string
  event: string
  headers: string
  launch_deployment_uid: string
  launch_environment_uid: string
  launch_project_uid: string
  management_token_uid: string
  metadata: string
  module: string
  module_uid: string
  org_uid: string
  payload: string
  project_uid: string
  remote_addr: string
  request: string
  request_id: string
  response: string
  sort: string
  stack: string
  uid: string
  vendor_uid: string
}

export interface ParsedMetadata {
  [key: string]: any
}

export interface ParsedPayload {
  [key: string]: any
}

export interface ProcessedAuditLog extends AuditLogData {
  parsedMetadata?: ParsedMetadata
  parsedPayload?: ParsedPayload
  parsedRequest?: any
  parsedResponse?: any
  timestamp: Date
}

export interface AnalyticsData {
  totalEvents: number
  uniqueUsers: number
  uniqueStacks: number
  eventsByType: { [key: string]: number }
  eventsByModule: { [key: string]: number }
  eventsByUser: { [key: string]: number }
  eventsByStack: { [key: string]: number }
  eventsByLocale: { [key: string]: number }
  eventsByDay: { date: string; count: number }[]
  eventsByHour: { hour: number; count: number }[]
  topUsers: { user: string; count: number; lastActivity: Date; activeInLast90Days: boolean }[]
  topStacks: { stack: string; count: number; uniqueUsers: number }[]
  recentActivity: ProcessedAuditLog[]
  userActivitySummary: {
    totalUsers: number
    activeInLast30Days: number
    activeInLast90Days: number
    neverActive: number
  }
  contentTypeUsageSummary: {
    totalContentTypes: number
    usedInLast30Days: number
    usedInLast90Days: number
    neverUsed: number
  }
  stackUsageRatio: { [stack: string]: { users: number; totalUsers: number; percentage: number } }
}

export interface UserActivity {
  user: string
  totalEvents: number
  lastActivity: Date
  eventTypes: { [key: string]: number }
  organizations: string[]
}

export interface OrgActivity {
  org: string
  totalEvents: number
  uniqueUsers: number
  eventTypes: { [key: string]: number }
  users: string[]
}

export interface ContentTypeActivity {
  contentType: string
  totalEvents: number
  operations: { [key: string]: number }
  users: string[]
  stacks: string[]
  locales: string[]
  lastUsed: Date
  usedInLast30Days: boolean
  usedInLast90Days: boolean
}

export interface StackActivity {
  stack: string
  totalEvents: number
  uniqueUsers: number
  contentTypes: string[]
  locales: string[]
  eventTypes: { [key: string]: number }
  users: string[]
  lastActivity: Date
}

export interface LocaleActivity {
  locale: string
  localeName: string
  totalEvents: number
  uniqueUsers: number
  contentTypes: string[]
  stacks: string[]
  eventTypes: { [key: string]: number }
  users: string[]
}

export interface UserEngagement {
  user: string
  totalEvents: number
  lastActivity: Date
  activeInLast30Days: boolean
  activeInLast90Days: boolean
  stacksUsed: string[]
  contentTypesUsed: string[]
  localesUsed: string[]
  isContentBuilder: boolean
  publishEvents: number
  createEvents: number
  updateEvents: number
  avgItemsPerStack: { [stack: string]: number }
  role?: string
}

export interface PublishMetrics {
  contentType: string
  totalPublishes: number
  totalEntries: number
  publishRatio: number
  publishesByPeriod: {
    last30Days: number
    last90Days: number
    allTime: number
  }
  byLocale: { [locale: string]: number }
  byStack: { [stack: string]: number }
  topPublishers: { user: string; count: number }[]
}

export interface ContentTypeLocaleAdoption {
  contentType: string
  locale: string
  localeName: string
  totalEntries: number
  publishedEntries: number
  lastActivity: Date
  activeUsers: string[]
}

export interface StackUserMetrics {
  stack: string
  totalUsers: number
  activeUsers30Days: number
  activeUsers90Days: number
  avgItemsPerAuthor: number
  userDetails: {
    user: string
    totalItems: number
    lastActivity: Date
    role?: string
    isActive30Days: boolean
    isActive90Days: boolean
  }[]
}
