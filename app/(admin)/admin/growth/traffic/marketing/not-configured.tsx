import { Settings } from "lucide-react";

export function NotConfigured() {
  return (
    <div className="rounded-xl border bg-card p-8 text-center space-y-4 max-w-lg mx-auto mt-8">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto">
        <Settings className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-semibold text-sm">Google integration not configured</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add these env vars to enable GSC keyword data and GA4 analytics.
        </p>
      </div>
      <div className="rounded-lg bg-muted p-4 text-left space-y-1 font-mono text-xs">
        <p className="text-muted-foreground"># Google OAuth credentials</p>
        <p>GOOGLE_OAUTH_CLIENT_ID=...</p>
        <p>GOOGLE_OAUTH_CLIENT_SECRET=...</p>
        <p>GOOGLE_OAUTH_REFRESH_TOKEN=...</p>
        <p className="text-muted-foreground mt-2"># Search Console site URL</p>
        <p>GSC_SITE_URL=sc-domain:thecvedge.com</p>
        <p className="text-muted-foreground mt-2"># GA4 numeric property ID</p>
        <p>GA4_PROPERTY_ID=123456789</p>
      </div>
    </div>
  );
}
