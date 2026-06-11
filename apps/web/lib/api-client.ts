// Stub: most old API methods are gone (Whimsy is now static + local LLM only).
// Kept for future backend integration. Safe to delete if not needed.

export interface ReportErrorArgs { id: string; error: string; }

export async function reportError(_args: ReportErrorArgs): Promise<void> {
  // No-op: there is no backend to report to in the static GitHub Pages deploy.
  // Kept as a stub so consumers (none right now) don't break.
  return;
}
