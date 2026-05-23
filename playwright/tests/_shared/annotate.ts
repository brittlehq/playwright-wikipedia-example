import { test } from '@playwright/test';

/**
 * Tiny helper to push Playwright annotations from a describe-scoped or
 * test-scoped `beforeEach`. Each entry becomes a row on the Brittle Session
 * Detail page's Annotations tab (the reporter forwards
 * `test.info().annotations` to `POST /api/sessions/:id/annotations`).
 *
 * Keep the `type` vocabulary tight — the dashboard treats type as the
 * annotation's free-text qualifier, so reusing the same handful of types
 * across the suite makes the dashboard column scannable.
 */
export type AnnotationType =
  | 'owner' // team that owns the test
  | 'severity' // blocker | high | medium | low
  | 'issue' // tracker ID (e.g. WIKI-204) for known flakes
  | 'doc' // link to docs / spec / runbook
  | 'reviewed'; // ISO date the test was last triaged

export function annotate(type: AnnotationType, description: string): void {
  test.info().annotations.push({ type, description });
}
