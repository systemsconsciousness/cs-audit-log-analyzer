import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }
  
  return formatDate(date)
}

export function getEventColor(event: string): string {
  const colors: { [key: string]: string } = {
    'create': '#10b981', // green
    'update': '#3b82f6', // blue
    'delete': '#ef4444', // red
    'publish': '#8b5cf6', // purple
    'unpublish': '#f59e0b', // amber
    'add': '#06b6d4', // cyan
    'remove': '#ec4899', // pink
    'login': '#84cc16', // lime
    'logout': '#6b7280', // gray
  }
  
  return colors[event.toLowerCase()] || '#6b7280'
}

export function getModuleColor(module: string): string {
  const colors: { [key: string]: string } = {
    'entry': '#3b82f6',
    'asset': '#10b981',
    'content_type': '#8b5cf6',
    'environment': '#f59e0b',
    'user': '#ec4899',
    'organization': '#06b6d4',
    'stack': '#ef4444',
    'launch': '#84cc16',
    'deployment': '#f97316',
  }
  
  return colors[module.toLowerCase()] || '#6b7280'
}
