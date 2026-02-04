# Phase 11: Analytics, Pixels & Legal Compliance - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Analytics tracking with visualization, third-party pixel support (Facebook Pixel, Google Analytics), and the legal infrastructure required to use those pixels compliantly. Includes GDPR/CCPA cookie consent, privacy policy, terms of service, data export, and account deletion.

**Not in scope:** Advanced analytics (geo, referrer, device breakdown) — that's Phase 15.

</domain>

<decisions>
## Implementation Decisions

### Insights Dashboard
- Hero metric: **Unique visitors** — show this prominently as the primary number
- Per-card analytics: **Ranked list** — cards sorted by clicks, top performer at top (leaderboard style)
- Time-series chart style: Claude's discretion
- Empty state: Claude's discretion

### Cookie Consent UX
- Banner style: **Corner popup** — small card in bottom-left or bottom-right corner
- Consent granularity: **All or nothing** — "Accept all" or "Reject all" binary choice
- Timing: **On scroll** — banner appears after user starts engaging with the page
- Theme matching: **Yes, theme-aware** — banner colors/fonts match the artist's page theme

### Pixel Configuration
- Location: **Insights tab** — alongside analytics, "track with your own tools too"
- Verification: **Test mode** — button to send test event + show confirmation
- Event tracking: Research best-in-class competitor patterns and match/exceed industry standards

### Legal Pages
- Privacy policy: **Auto-generated** — LinkLobby generates based on features the artist uses
- Link placement: **Footer only** — small link at very bottom of page
- GDPR data export: **ZIP with files** — folder containing JSON + images + separate files
- Account deletion: **30-day grace period** — account disabled immediately, data deleted after 30 days (allows recovery)

### Claude's Discretion
- Time-series chart type (line, area, or bar)
- Empty state approach for Insights tab
- Standard event names for pixels (no customization needed)
- Exact corner position for cookie banner (left vs right)

</decisions>

<specifics>
## Specific Ideas

- "Study how the best in the business do it and exceed or meet them" for pixel event tracking — research Linktree, Beacons, and major analytics platforms for event patterns

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-analytics-pixels-legal*
*Context gathered: 2026-02-05*
