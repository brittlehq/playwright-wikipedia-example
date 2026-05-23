/**
 * Inline HTML fixture used by failure tests. Encoded as a data: URL so the
 * tests don't need an HTTP server running anywhere.
 *
 * Layout:
 *  - #ok-btn               normal clickable button
 *  - #disabled-btn         disabled button (raises "element not interactable")
 *  - #hidden-btn           display:none (never becomes clickable)
 *  - #covered-btn          fully overlaid by an absolute-positioned div
 *  - #greeting             <h1> with known text "Hello World"
 *  - #username             text input
 *  - #status               span whose text changes on click
 */
const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Brittle WDIO Sample Fixture</title>
<style>
  body { font-family: system-ui, sans-serif; padding: 24px; max-width: 640px; }
  button { padding: 6px 12px; margin: 4px; }
  .stack { position: relative; display: inline-block; }
  .overlay {
    position: absolute; inset: 0; background: rgba(0,0,0,0.05);
    cursor: not-allowed;
  }
</style></head>
<body>
  <h1 id="greeting">Hello World</h1>
  <p>Sample fixture for Brittle WDIO tests.</p>

  <button id="ok-btn" onclick="document.getElementById('status').textContent='clicked'">Click me</button>
  <button id="disabled-btn" disabled>Disabled</button>
  <button id="hidden-btn" style="display:none">Hidden</button>

  <span class="stack">
    <button id="covered-btn">Covered</button>
    <span class="overlay" aria-label="overlay"></span>
  </span>

  <p>Status: <span id="status">idle</span></p>

  <label>Username: <input id="username" type="text"></label>
</body>
</html>`;

export const FIXTURE_URL = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
