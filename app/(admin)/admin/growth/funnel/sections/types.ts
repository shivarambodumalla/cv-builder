export interface Stage { key: string; label: string; count: number; icon?: string }
export interface PageVisit { path: string; label: string; count: number; type: "public" | "private" }
export interface BounceItem { path: string; label: string; views: number; bouncePct: number; reachLoginPct: number }
export interface SignupSource { page: string; count: number; pct: number }
export interface FunnelStep { key: string; label: string; count: number }
export interface PopupMetric { id: string; label: string; shown: number; clicked: number; dismissed: number; conversionPct: number }
export interface PayClicker {
  userId: string; email: string | null; period: string; attempts: number;
  firstClickedAt: string; lastClickedAt: string; convertedAt: string | null; converted: boolean;
}
export interface TimePoint { date: string; count: number }
export interface CareerPathDetail {
  rolePageViews: number; startedRole: number; startedResume: number;
  created: { role: number; resume: number }; claimed: { role: number; resume: number };
}
export interface FunnelData {
  awareness: Stage[]; acquisition: Stage[]; engagement: Stage[]; conversion: Stage[]; extras: Stage[];
  interviewFunnel: FunnelStep[]; cvReviewFunnel: FunnelStep[];
  careerPathFunnel: FunnelStep[]; careerPathDetail: CareerPathDetail;
  anonToSignup: FunnelStep[]; loginToDownload: FunnelStep[];
  pageVisits: PageVisit[]; totalAnonVisits: number; totalUniqueVisitors: number; totalPageViews: number; newSignups: number;
  bounceAnalysis: BounceItem[]; signupSources: SignupSource[];
  popups: PopupMetric[];
  payClickers: PayClicker[];
  visitsOverTime: TimePoint[]; signupsOverTime: TimePoint[];
}
