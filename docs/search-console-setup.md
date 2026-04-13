# Google Search Console Setup

1. Go to search.google.com/search-console
2. Add property: thecvedge.com
3. Verify via HTML meta tag:
   - Copy verification code
   - Add to Vercel env: GOOGLE_SITE_VERIFICATION=your_code
   - Deploy
4. Submit sitemap:
   - Sitemaps → Enter: https://thecvedge.com/sitemap.xml → Submit
5. Request indexing for key pages:
   - URL Inspection → enter URL → Request indexing
   - Pages: / /pricing /resumes /interview-coach /upload-resume /jobs

# Bing Webmaster Tools
1. Go to bing.com/webmasters
2. Add site: thecvedge.com
3. Import from Google Search Console (easiest)
4. Submit sitemap: https://thecvedge.com/sitemap.xml
