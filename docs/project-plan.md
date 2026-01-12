# Jeff Hill's Real Estate Site - Project Plan

**Created:** January 12, 2026
**Stack:** HTML + Tailwind CSS (static site)
**Hosting:** Vercel (free subdomain: jeff-hills-real-estate-site.vercel.app)

---

## Site Structure

### Layout
- **Left Sidebar** - Profile photo, bio, credentials, menu items
- **Main Content Area**
  - Top banner
  - Insights/Blog section (fed from Google Sheets)
  - MLS listings embed
  - CTA sections for different audiences

### CTA Sections
- Need to Sell
- Want to Sell
- Need to Buy
- Want to Buy
- Want to Build
- Want to Invest

Each CTA opens an inquiry form modal that submits to Google Sheets.

---

## Your To-Do List

### Setup
- [ ] Create GitHub repo
- [ ] Connect repo to Vercel

### Content & Assets
- [ ] Headshot/profile photo
- [ ] Bio text and credentials
- [ ] Logo/branding colors
- [ ] Banner image(s)
- [ ] Initial insights/blog content

### MLS
- [ ] Get embed code from your MLS provider
- [ ] Confirm what's allowed per license

### Google Integration
- [ ] Create Google Sheet with tabs:
  - `Inquiries` - form submissions
  - `Insights` - blog posts (title, date, content, image_url)
- [ ] Set up Google Apps Script web app endpoint

---

## Claude Can Help With

1. Scaffold HTML/Tailwind project structure
2. Build responsive layout (sidebar + main content)
3. Create inquiry form modals for each CTA
4. Google Sheets integration (Apps Script + fetch code)
5. Insights section that pulls from Google Sheets
6. MLS embed integration
7. Vercel deployment config

---

## Google Sheets Structure

### Inquiries Tab
| timestamp | name | email | phone | inquiry_type | message |
|-----------|------|-------|-------|--------------|---------|

### Insights Tab
| id | date | title | summary | content | image_url | published |
|----|------|-------|---------|---------|-----------|-----------|

---

## Notes
- No backend needed - Google Sheets acts as simple CMS
- Static HTML with vanilla JS for form handling and fetching insights
- Mobile-responsive design
