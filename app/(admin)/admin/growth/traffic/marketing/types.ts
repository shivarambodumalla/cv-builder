import type { BingReport } from "@/lib/bing/client";

export interface QueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  prevPosition: number | null;
  positionDelta: number | null;
  page: string | null;
  sessions: number | null;
  engagementRate: number | null;
  avgDuration: number | null;
}

export interface PageRow {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface TrendPoint {
  date: string;
  clicks: number;
  impressions: number;
}

export interface Channel {
  channel: string;
  sessions: number;
  newUsers: number;
}

export interface GeoRow {
  country: string;
  countryCode: string;
  sessions: number;
  newUsers: number;
  engagedSessions: number;
}

export interface DeviceRow {
  device: string;
  sessions: number;
  sharePercent: number;
  engagementRate: number;
  avgDuration: number;
  pagesPerSession: number;
  qualityScore: number;
}

export interface NvRRow {
  type: "new" | "returning";
  sessions: number;
  engagementRate: number;
  avgDuration: number;
  pagesPerSession: number;
}

export interface SessionQualityRow {
  channel: string;
  sessions: number;
  engagementRate: number;
  avgDuration: number;
  pagesPerSession: number;
  bounceRate: number;
  qualityScore: number;
}

export interface LandingPageRow {
  page: string;
  sessions: number;
  engagementRate: number;
  avgDuration: number;
  bounceRate: number;
  newUsersPercent: number;
}

export interface DayRow {
  day: string;
  sessions: number;
}

export interface HourRow {
  hour: number;
  sessions: number;
}

export interface Summary {
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
}

export interface Data {
  configured: boolean;
  authFailed?: boolean;
  gscConfigured: boolean;
  /** The Search Console window actually queried (shifted back for its ~3-day lag). */
  gscRange?: { from: string; to: string };
  ga4Configured: boolean;
  summary: Summary;
  topQueries: QueryRow[];
  topPages: PageRow[];
  trend: TrendPoint[];
  channels: Channel[];
  geo: GeoRow[];
  devices: DeviceRow[];
  newVsReturning: NvRRow[];
  sessionQuality: SessionQualityRow[];
  landingPages: LandingPageRow[];
  dayOfWeek: DayRow[];
  hourly: HourRow[];
  bing?: BingReport;
}
