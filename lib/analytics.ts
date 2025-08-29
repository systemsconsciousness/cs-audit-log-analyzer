import { ProcessedAuditLog, AnalyticsData, UserActivity, OrgActivity, ContentTypeActivity, StackActivity, LocaleActivity, UserEngagement, PublishMetrics, ContentTypeLocaleAdoption, StackUserMetrics } from '@/types/audit-log'
import { format, startOfDay, startOfHour, subDays, isAfter } from 'date-fns'

export const analyzeAuditLogs = (data: ProcessedAuditLog[]): AnalyticsData => {
  const eventsByType: { [key: string]: number } = {}
  const eventsByModule: { [key: string]: number } = {}
  const eventsByUser: { [key: string]: number } = {}
  const eventsByStack: { [key: string]: number } = {}
  const eventsByLocale: { [key: string]: number } = {}
  const eventsByDay: { [key: string]: number } = {}
  const eventsByHour: { [key: number]: number } = {}
  
  const uniqueUsers = new Set<string>()
  const uniqueStacks = new Set<string>()
  const userLastActivity: { [key: string]: Date } = {}
  const userEventCounts: { [key: string]: number } = {}
  const contentTypeLastUsed: { [key: string]: Date } = {}
  const contentTypeUsage = new Set<string>()
  
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)
  const ninetyDaysAgo = subDays(now, 90)

  // Initialize hour buckets
  for (let i = 0; i < 24; i++) {
    eventsByHour[i] = 0
  }

  data.forEach(log => {
    // Count events by type
    if (log.event) {
      eventsByType[log.event] = (eventsByType[log.event] || 0) + 1
    }

    // Count events by module
    if (log.module) {
      eventsByModule[log.module] = (eventsByModule[log.module] || 0) + 1
    }

    // Count events by user and track activity
    if (log.created_by) {
      eventsByUser[log.created_by] = (eventsByUser[log.created_by] || 0) + 1
      userEventCounts[log.created_by] = (userEventCounts[log.created_by] || 0) + 1
      uniqueUsers.add(log.created_by)
      
      // Track last activity
      if (!userLastActivity[log.created_by] || log.timestamp > userLastActivity[log.created_by]) {
        userLastActivity[log.created_by] = log.timestamp
      }
    }

    // Count events by stack
    if (log.stack) {
      eventsByStack[log.stack] = (eventsByStack[log.stack] || 0) + 1
      uniqueStacks.add(log.stack)
    }

    // Count events by locale
    if (log.parsedMetadata?.locale?.code) {
      const locale = log.parsedMetadata.locale.code
      eventsByLocale[locale] = (eventsByLocale[locale] || 0) + 1
    }

    // Track content type usage
    if (log.parsedMetadata?.content_type?.uid) {
      const contentType = log.parsedMetadata.content_type.uid
      contentTypeUsage.add(contentType)
      if (!contentTypeLastUsed[contentType] || log.timestamp > contentTypeLastUsed[contentType]) {
        contentTypeLastUsed[contentType] = log.timestamp
      }
    }

    // Count events by day
    const dayKey = format(log.timestamp, 'yyyy-MM-dd')
    eventsByDay[dayKey] = (eventsByDay[dayKey] || 0) + 1

    // Count events by hour
    const hour = log.timestamp.getHours()
    eventsByHour[hour] = (eventsByHour[hour] || 0) + 1
  })

  // Calculate user activity summaries
  const activeInLast30Days = Object.values(userLastActivity).filter(date => isAfter(date, thirtyDaysAgo)).length
  const activeInLast90Days = Object.values(userLastActivity).filter(date => isAfter(date, ninetyDaysAgo)).length
  
  // Calculate content type usage summaries
  const contentTypesUsedInLast30Days = Object.entries(contentTypeLastUsed).filter(([, date]) => isAfter(date, thirtyDaysAgo)).length
  const contentTypesUsedInLast90Days = Object.entries(contentTypeLastUsed).filter(([, date]) => isAfter(date, ninetyDaysAgo)).length

  // Convert to arrays and sort
  const topUsers = Object.entries(eventsByUser)
    .map(([user, count]) => ({
      user,
      count,
      lastActivity: userLastActivity[user] || new Date(0),
      activeInLast90Days: userLastActivity[user] ? isAfter(userLastActivity[user], ninetyDaysAgo) : false
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  // Calculate stack usage with user counts
  const stackUserCounts: { [stack: string]: Set<string> } = {}
  data.forEach(log => {
    if (log.stack && log.created_by) {
      if (!stackUserCounts[log.stack]) {
        stackUserCounts[log.stack] = new Set()
      }
      stackUserCounts[log.stack].add(log.created_by)
    }
  })

  const topStacks = Object.entries(eventsByStack)
    .map(([stack, count]) => ({
      stack,
      count,
      uniqueUsers: stackUserCounts[stack]?.size || 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Calculate stack usage ratios
  const stackUsageRatio: { [stack: string]: { users: number; totalUsers: number; percentage: number } } = {}
  Object.entries(stackUserCounts).forEach(([stack, users]) => {
    stackUsageRatio[stack] = {
      users: users.size,
      totalUsers: uniqueUsers.size,
      percentage: uniqueUsers.size > 0 ? (users.size / uniqueUsers.size) * 100 : 0
    }
  })

  const eventsByDayArray = Object.entries(eventsByDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const eventsByHourArray = Object.entries(eventsByHour)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => a.hour - b.hour)

  const recentActivity = data
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 50)

  return {
    totalEvents: data.length,
    uniqueUsers: uniqueUsers.size,
    uniqueStacks: uniqueStacks.size,
    eventsByType,
    eventsByModule,
    eventsByUser,
    eventsByStack,
    eventsByLocale,
    eventsByDay: eventsByDayArray,
    eventsByHour: eventsByHourArray,
    topUsers,
    topStacks,
    recentActivity,
    userActivitySummary: {
      totalUsers: uniqueUsers.size,
      activeInLast30Days,
      activeInLast90Days,
      neverActive: uniqueUsers.size - activeInLast90Days
    },
    contentTypeUsageSummary: {
      totalContentTypes: contentTypeUsage.size,
      usedInLast30Days: contentTypesUsedInLast30Days,
      usedInLast90Days: contentTypesUsedInLast90Days,
      neverUsed: Math.max(0, contentTypeUsage.size - contentTypesUsedInLast90Days)
    },
    stackUsageRatio
  }
}

export const analyzeUserActivity = (data: ProcessedAuditLog[]): UserActivity[] => {
  const userMap: { [key: string]: UserActivity } = {}

  data.forEach(log => {
    if (!log.created_by) return

    if (!userMap[log.created_by]) {
      userMap[log.created_by] = {
        user: log.created_by,
        totalEvents: 0,
        lastActivity: log.timestamp,
        eventTypes: {},
        organizations: []
      }
    }

    const user = userMap[log.created_by]
    user.totalEvents++
    
    if (log.timestamp > user.lastActivity) {
      user.lastActivity = log.timestamp
    }

    if (log.event) {
      user.eventTypes[log.event] = (user.eventTypes[log.event] || 0) + 1
    }

    if (log.org_uid && !user.organizations.includes(log.org_uid)) {
      user.organizations.push(log.org_uid)
    }
  })

  return Object.values(userMap).sort((a, b) => b.totalEvents - a.totalEvents)
}

export const analyzeOrgActivity = (data: ProcessedAuditLog[]): OrgActivity[] => {
  const orgMap: { [key: string]: OrgActivity } = {}

  data.forEach(log => {
    if (!log.org_uid) return

    if (!orgMap[log.org_uid]) {
      orgMap[log.org_uid] = {
        org: log.org_uid,
        totalEvents: 0,
        uniqueUsers: 0,
        eventTypes: {},
        users: []
      }
    }

    const org = orgMap[log.org_uid]
    org.totalEvents++

    if (log.event) {
      org.eventTypes[log.event] = (org.eventTypes[log.event] || 0) + 1
    }

    if (log.created_by && !org.users.includes(log.created_by)) {
      org.users.push(log.created_by)
    }
  })

  // Calculate unique users
  Object.values(orgMap).forEach(org => {
    org.uniqueUsers = org.users.length
  })

  return Object.values(orgMap).sort((a, b) => b.totalEvents - a.totalEvents)
}

export const analyzeContentTypeActivity = (data: ProcessedAuditLog[]): ContentTypeActivity[] => {
  const contentTypeMap: { [key: string]: ContentTypeActivity } = {}
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)
  const ninetyDaysAgo = subDays(now, 90)

  data.forEach(log => {
    // Extract content type from metadata or payload
    let contentType = ''
    
    if (log.parsedMetadata?.content_type?.uid) {
      contentType = log.parsedMetadata.content_type.uid
    } else if (log.parsedMetadata?.content_type?.title) {
      contentType = log.parsedMetadata.content_type.title
    } else if (log.parsedPayload?.content_type) {
      contentType = log.parsedPayload.content_type
    } else if (log.module === 'entry' && log.event) {
      contentType = 'Entry Operations'
    } else if (log.module === 'asset' && log.event) {
      contentType = 'Asset Operations'
    }

    if (!contentType) return

    if (!contentTypeMap[contentType]) {
      contentTypeMap[contentType] = {
        contentType,
        totalEvents: 0,
        operations: {},
        users: [],
        stacks: [],
        locales: [],
        lastUsed: log.timestamp,
        usedInLast30Days: false,
        usedInLast90Days: false
      }
    }

    const ct = contentTypeMap[contentType]
    ct.totalEvents++

    // Update last used date
    if (log.timestamp > ct.lastUsed) {
      ct.lastUsed = log.timestamp
    }

    // Check if used in recent periods
    if (isAfter(log.timestamp, thirtyDaysAgo)) {
      ct.usedInLast30Days = true
    }
    if (isAfter(log.timestamp, ninetyDaysAgo)) {
      ct.usedInLast90Days = true
    }

    if (log.event) {
      ct.operations[log.event] = (ct.operations[log.event] || 0) + 1
    }

    if (log.created_by && !ct.users.includes(log.created_by)) {
      ct.users.push(log.created_by)
    }

    if (log.stack && !ct.stacks.includes(log.stack)) {
      ct.stacks.push(log.stack)
    }

    if (log.parsedMetadata?.locale?.code && !ct.locales.includes(log.parsedMetadata.locale.code)) {
      ct.locales.push(log.parsedMetadata.locale.code)
    }
  })

  return Object.values(contentTypeMap).sort((a, b) => b.totalEvents - a.totalEvents)
}

export const getModuleInsights = (data: ProcessedAuditLog[]) => {
  const moduleStats: { [key: string]: any } = {}

  data.forEach(log => {
    if (!log.module) return

    if (!moduleStats[log.module]) {
      moduleStats[log.module] = {
        module: log.module,
        totalEvents: 0,
        events: {},
        users: new Set(),
        orgs: new Set(),
        recentActivity: []
      }
    }

    const module = moduleStats[log.module]
    module.totalEvents++
    
    if (log.event) {
      module.events[log.event] = (module.events[log.event] || 0) + 1
    }
    
    if (log.created_by) {
      module.users.add(log.created_by)
    }
    
    if (log.org_uid) {
      module.orgs.add(log.org_uid)
    }

    module.recentActivity.push(log)
  })

  // Convert sets to counts and sort recent activity
  Object.values(moduleStats).forEach((module: any) => {
    module.uniqueUsers = module.users.size
    module.uniqueOrgs = module.orgs.size
    module.recentActivity = module.recentActivity
      .sort((a: ProcessedAuditLog, b: ProcessedAuditLog) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10)
    delete module.users
    delete module.orgs
  })

  return Object.values(moduleStats).sort((a: any, b: any) => b.totalEvents - a.totalEvents)
}

export const analyzeStackActivity = (data: ProcessedAuditLog[]): StackActivity[] => {
  const stackMap: { [key: string]: StackActivity } = {}

  data.forEach(log => {
    if (!log.stack) return

    if (!stackMap[log.stack]) {
      stackMap[log.stack] = {
        stack: log.stack,
        totalEvents: 0,
        uniqueUsers: 0,
        contentTypes: [],
        locales: [],
        eventTypes: {},
        users: [],
        lastActivity: log.timestamp
      }
    }

    const stack = stackMap[log.stack]
    stack.totalEvents++

    if (log.timestamp > stack.lastActivity) {
      stack.lastActivity = log.timestamp
    }

    if (log.event) {
      stack.eventTypes[log.event] = (stack.eventTypes[log.event] || 0) + 1
    }

    if (log.created_by && !stack.users.includes(log.created_by)) {
      stack.users.push(log.created_by)
    }

    if (log.parsedMetadata?.content_type?.uid && !stack.contentTypes.includes(log.parsedMetadata.content_type.uid)) {
      stack.contentTypes.push(log.parsedMetadata.content_type.uid)
    }

    if (log.parsedMetadata?.locale?.code && !stack.locales.includes(log.parsedMetadata.locale.code)) {
      stack.locales.push(log.parsedMetadata.locale.code)
    }
  })

  // Calculate unique users
  Object.values(stackMap).forEach(stack => {
    stack.uniqueUsers = stack.users.length
  })

  return Object.values(stackMap).sort((a, b) => b.totalEvents - a.totalEvents)
}

export const analyzeLocaleActivity = (data: ProcessedAuditLog[]): LocaleActivity[] => {
  const localeMap: { [key: string]: LocaleActivity } = {}

  data.forEach(log => {
    if (!log.parsedMetadata?.locale?.code) return

    const localeCode = log.parsedMetadata.locale.code
    const localeName = log.parsedMetadata.locale.name || localeCode

    if (!localeMap[localeCode]) {
      localeMap[localeCode] = {
        locale: localeCode,
        localeName,
        totalEvents: 0,
        uniqueUsers: 0,
        contentTypes: [],
        stacks: [],
        eventTypes: {},
        users: []
      }
    }

    const locale = localeMap[localeCode]
    locale.totalEvents++

    if (log.event) {
      locale.eventTypes[log.event] = (locale.eventTypes[log.event] || 0) + 1
    }

    if (log.created_by && !locale.users.includes(log.created_by)) {
      locale.users.push(log.created_by)
    }

    if (log.parsedMetadata?.content_type?.uid && !locale.contentTypes.includes(log.parsedMetadata.content_type.uid)) {
      locale.contentTypes.push(log.parsedMetadata.content_type.uid)
    }

    if (log.stack && !locale.stacks.includes(log.stack)) {
      locale.stacks.push(log.stack)
    }
  })

  // Calculate unique users
  Object.values(localeMap).forEach(locale => {
    locale.uniqueUsers = locale.users.length
  })

  return Object.values(localeMap).sort((a, b) => b.totalEvents - a.totalEvents)
}

export const analyzeUserEngagement = (data: ProcessedAuditLog[]): UserEngagement[] => {
  const userMap: { [key: string]: UserEngagement } = {}
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)
  const ninetyDaysAgo = subDays(now, 90)

  data.forEach(log => {
    if (!log.created_by) return

    if (!userMap[log.created_by]) {
      userMap[log.created_by] = {
        user: log.created_by,
        totalEvents: 0,
        lastActivity: log.timestamp,
        activeInLast30Days: false,
        activeInLast90Days: false,
        stacksUsed: [],
        contentTypesUsed: [],
        localesUsed: [],
        isContentBuilder: false,
        publishEvents: 0,
        createEvents: 0,
        updateEvents: 0,
        avgItemsPerStack: {}
      }
    }

    const user = userMap[log.created_by]
    user.totalEvents++

    if (log.timestamp > user.lastActivity) {
      user.lastActivity = log.timestamp
    }

    // Check activity periods
    if (isAfter(log.timestamp, thirtyDaysAgo)) {
      user.activeInLast30Days = true
    }
    if (isAfter(log.timestamp, ninetyDaysAgo)) {
      user.activeInLast90Days = true
    }

    // Track event types for content building detection
    if (log.event === 'publish' || log.event === 'unpublish') {
      user.publishEvents++
    }
    if (log.event === 'create') {
      user.createEvents++
    }
    if (log.event === 'update') {
      user.updateEvents++
    }

    // Determine if user is a content builder
    if (user.createEvents > 0 || user.updateEvents > 5 || user.publishEvents > 0) {
      user.isContentBuilder = true
    }

    // Track stacks used
    if (log.stack && !user.stacksUsed.includes(log.stack)) {
      user.stacksUsed.push(log.stack)
    }

    // Track content types used
    if (log.parsedMetadata?.content_type?.uid && !user.contentTypesUsed.includes(log.parsedMetadata.content_type.uid)) {
      user.contentTypesUsed.push(log.parsedMetadata.content_type.uid)
    }

    // Track locales used
    if (log.parsedMetadata?.locale?.code && !user.localesUsed.includes(log.parsedMetadata.locale.code)) {
      user.localesUsed.push(log.parsedMetadata.locale.code)
    }
  })

  return Object.values(userMap).sort((a, b) => b.totalEvents - a.totalEvents)
}

export const analyzePublishMetrics = (data: ProcessedAuditLog[]): PublishMetrics[] => {
  const contentTypeMap: { [key: string]: any } = {}
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)
  const ninetyDaysAgo = subDays(now, 90)

  data.forEach(log => {
    // Extract content type
    let contentType = ''
    if (log.parsedMetadata?.content_type?.uid) {
      contentType = log.parsedMetadata.content_type.uid
    } else if (log.parsedMetadata?.content_type?.title) {
      contentType = log.parsedMetadata.content_type.title
    }

    if (!contentType) return

    if (!contentTypeMap[contentType]) {
      contentTypeMap[contentType] = {
        contentType,
        totalPublishes: 0,
        totalEntries: new Set(),
        publishesByPeriod: { last30Days: 0, last90Days: 0, allTime: 0 },
        byLocale: {},
        byStack: {},
        publishers: {}
      }
    }

    const ct = contentTypeMap[contentType]

    // Count entries (unique UIDs)
    if (log.parsedMetadata?.uid) {
      ct.totalEntries.add(log.parsedMetadata.uid)
    }

    // Count publishes
    if (log.event === 'publish' || log.event === 'unpublish') {
      ct.totalPublishes++
      ct.publishesByPeriod.allTime++

      if (isAfter(log.timestamp, thirtyDaysAgo)) {
        ct.publishesByPeriod.last30Days++
      }
      if (isAfter(log.timestamp, ninetyDaysAgo)) {
        ct.publishesByPeriod.last90Days++
      }

      // By locale
      if (log.parsedMetadata?.locale?.code) {
        const locale = log.parsedMetadata.locale.code
        ct.byLocale[locale] = (ct.byLocale[locale] || 0) + 1
      }

      // By stack
      if (log.stack) {
        ct.byStack[log.stack] = (ct.byStack[log.stack] || 0) + 1
      }

      // By publisher
      if (log.created_by) {
        ct.publishers[log.created_by] = (ct.publishers[log.created_by] || 0) + 1
      }
    }
  })

  return Object.values(contentTypeMap).map((ct: any) => ({
    contentType: ct.contentType,
    totalPublishes: ct.totalPublishes,
    totalEntries: ct.totalEntries.size,
    publishRatio: ct.totalEntries.size > 0 ? ct.totalPublishes / ct.totalEntries.size : 0,
    publishesByPeriod: ct.publishesByPeriod,
    byLocale: ct.byLocale,
    byStack: ct.byStack,
    topPublishers: Object.entries(ct.publishers)
      .map(([user, count]) => ({ user, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  })).sort((a, b) => b.totalPublishes - a.totalPublishes)
}

export const analyzeContentTypeLocaleAdoption = (data: ProcessedAuditLog[]): ContentTypeLocaleAdoption[] => {
  const adoptionMap: { [key: string]: any } = {}

  data.forEach(log => {
    let contentType = ''
    if (log.parsedMetadata?.content_type?.uid) {
      contentType = log.parsedMetadata.content_type.uid
    } else if (log.parsedMetadata?.content_type?.title) {
      contentType = log.parsedMetadata.content_type.title
    }

    const locale = log.parsedMetadata?.locale?.code
    const localeName = log.parsedMetadata?.locale?.name

    if (!contentType || !locale) return

    const key = `${contentType}_${locale}`

    if (!adoptionMap[key]) {
      adoptionMap[key] = {
        contentType,
        locale,
        localeName: localeName || locale,
        entries: new Set(),
        publishedEntries: new Set(),
        lastActivity: log.timestamp,
        users: new Set()
      }
    }

    const adoption = adoptionMap[key]

    // Track entries
    if (log.parsedMetadata?.uid) {
      adoption.entries.add(log.parsedMetadata.uid)
    }

    // Track published entries
    if ((log.event === 'publish') && log.parsedMetadata?.uid) {
      adoption.publishedEntries.add(log.parsedMetadata.uid)
    }

    // Track last activity
    if (log.timestamp > adoption.lastActivity) {
      adoption.lastActivity = log.timestamp
    }

    // Track users
    if (log.created_by) {
      adoption.users.add(log.created_by)
    }
  })

  return Object.values(adoptionMap).map((adoption: any) => ({
    contentType: adoption.contentType,
    locale: adoption.locale,
    localeName: adoption.localeName,
    totalEntries: adoption.entries.size,
    publishedEntries: adoption.publishedEntries.size,
    lastActivity: adoption.lastActivity,
    activeUsers: Array.from(adoption.users) as string[],
    adoptionScore: adoption.entries.size * (adoption.users.size * 0.5) + (adoption.publishedEntries.size * 2)
  })).sort((a, b) => b.adoptionScore - a.adoptionScore)
}

export const analyzeStackUserMetrics = (data: ProcessedAuditLog[]): StackUserMetrics[] => {
  const stackMap: { [key: string]: any } = {}
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)
  const ninetyDaysAgo = subDays(now, 90)

  data.forEach(log => {
    if (!log.stack || !log.created_by) return

    if (!stackMap[log.stack]) {
      stackMap[log.stack] = {
        stack: log.stack,
        users: {}
      }
    }

    const stack = stackMap[log.stack]

    if (!stack.users[log.created_by]) {
      stack.users[log.created_by] = {
        user: log.created_by,
        totalItems: 0,
        lastActivity: log.timestamp,
        events: []
      }
    }

    const user = stack.users[log.created_by]
    user.totalItems++
    user.events.push(log)

    if (log.timestamp > user.lastActivity) {
      user.lastActivity = log.timestamp
    }
  })

  return Object.values(stackMap).map((stack: any) => {
    const users = Object.values(stack.users) as any[]
    const totalUsers = users.length
    const activeUsers30Days = users.filter(u => isAfter(u.lastActivity, thirtyDaysAgo)).length
    const activeUsers90Days = users.filter(u => isAfter(u.lastActivity, ninetyDaysAgo)).length
    const totalItems = users.reduce((sum, u) => sum + u.totalItems, 0)
    const avgItemsPerAuthor = totalUsers > 0 ? totalItems / totalUsers : 0

    return {
      stack: stack.stack,
      totalUsers,
      activeUsers30Days,
      activeUsers90Days,
      avgItemsPerAuthor: Math.round(avgItemsPerAuthor * 100) / 100,
      userDetails: users.map(u => ({
        user: u.user,
        totalItems: u.totalItems,
        lastActivity: u.lastActivity,
        isActive30Days: isAfter(u.lastActivity, thirtyDaysAgo),
        isActive90Days: isAfter(u.lastActivity, ninetyDaysAgo)
      })).sort((a, b) => b.totalItems - a.totalItems)
    }
  }).sort((a, b) => b.totalUsers - a.totalUsers)
}
