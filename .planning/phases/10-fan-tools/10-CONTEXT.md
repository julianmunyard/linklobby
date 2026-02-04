# Phase 10: Fan Tools - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Capture fan data and control content release timing. Artists can collect emails, generate QR codes, and feature content with countdowns/scheduling. This phase delivers email collection, export, Mailchimp integration, QR code generation, release mode, and link scheduling.

</domain>

<decisions>
## Implementation Decisions

### Link Scheduling

- **Editor appearance:** Scheduled links visible with badge showing publish date (not dimmed or hidden)
- **Expired links:** Auto-hide from public page, remain in editor marked 'Expired'
- **Timezones:** Display in browser's local timezone automatically (no explicit timezone setting)
- **Schedule UI:** Dedicated 'Schedule' tab showing all cards with their timing (not per-card property fields)

### Release Mode

- **Card behavior:** Release card is a normal card that can be positioned anywhere in flow (not pinned or takeover)
- **Countdown:** Optional per-release — artist toggles countdown on/off for each release card
- **When release goes live:** Auto-converts to music card if URL is Spotify/Apple Music/etc.
- **Pre-release styling:** Special 'coming soon' card design with album art, countdown timer, and pre-save button

### Claude's Discretion

- Email collection form design and fields
- QR code appearance and download options
- Mailchimp sync implementation details
- Countdown timer styling (flip clock, numeric, etc.)
- 'Out Now' transition animation when release goes live

</decisions>

<specifics>
## Specific Ideas

- Release card auto-converting to playable music embed when it goes live is a smooth UX transition
- Dedicated scheduling tab gives overview of all timed content in one place

</specifics>

<deferred>
## Deferred Ideas

- Email Collection UX details — user chose to skip discussion, Claude has discretion
- QR Code Presentation — not discussed, Claude has discretion

</deferred>

---

*Phase: 10-fan-tools*
*Context gathered: 2026-02-05*
