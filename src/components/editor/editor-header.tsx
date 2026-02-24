/**
 * Editor header barrel — re-exports the dashboard header (which IS the editor
 * header) and the dev-only template saver so plan consumers can import from
 * a single editor-scoped location.
 *
 * DevTemplateSaver is integrated into DashboardHeader and is gated behind
 * NEXT_PUBLIC_DEV_TOOLS=true, so it has zero impact on production builds.
 */
export { DashboardHeader as EditorHeader } from "@/components/dashboard/dashboard-header"
export { DevTemplateSaver, DevTemplateManager, DevQuickResave } from "@/components/editor/dev-template-saver"
