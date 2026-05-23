import { FIXTURE_URL } from './fixtures.js';

/**
 * Failure modes intentionally exercised:
 *  - element not found (selector miss / timeout)
 *  - element not interactable (disabled)
 *  - element click intercepted (overlay)
 *  - hidden element never clickable (display:none)
 *  - assertion mismatch on element text
 *  - unhandled JS error in executeScript
 *  - navigation to unreachable host
 *  - timeout on waitForExist
 *
 * Each test is intentionally short — we cap waitFor* timeouts at 2s so the
 * full suite completes in under 30s.
 */
describe('UI failure modes @failure', () => {
  beforeEach(async () => {
    await browser.url(FIXTURE_URL);
  });

  it('passes when the happy path is satisfied', async () => {
    const okBtn = await $('#ok-btn');
    await okBtn.click();
    const status = await $('#status');
    const text = await status.getText();
    expect(text).toBe('clicked');
  });

  it('fails when the selector does not match anything', async () => {
    // findElement timeout — element does not exist.
    const missing = await $('#does-not-exist');
    await missing.waitForExist({ timeout: 2000 });
  });

  it('fails when the target element is disabled', async () => {
    const disabled = await $('#disabled-btn');
    await disabled.waitForClickable({ timeout: 2000 });
    await disabled.click();
  });

  it('fails when an overlay intercepts the click', async () => {
    const covered = await $('#covered-btn');
    // WebDriver raises "element click intercepted" because the overlay
    // sits on top of the target at the click point.
    await covered.click();
  });

  it('fails when the element is hidden via display:none', async () => {
    const hidden = await $('#hidden-btn');
    await hidden.waitForDisplayed({ timeout: 2000 });
    await hidden.click();
  });

  it('fails when assertion text does not match', async () => {
    const heading = await $('#greeting');
    const text = await heading.getText();
    expect(text).toBe('Goodbye Universe');
  });

  it('fails when executed JS throws', async () => {
    await browser.execute(() => {
      throw new Error('intentional boom from injected script');
    });
  });

  it('fails when typing into a non-existent input', async () => {
    const input = await $('#totally-missing-input');
    await input.waitForExist({ timeout: 2000 });
    await input.setValue('something');
  });

  it('fails when navigating to an unreachable host', async () => {
    // Chrome surfaces this as "net::ERR_NAME_NOT_RESOLVED" in the navigation result.
    await browser.url('https://this-host-does-not-exist-12345.invalid');
  });

  it('fails when waitUntil never settles', async () => {
    await browser.waitUntil(
      async () => {
        const status = await $('#status');
        return (await status.getText()) === 'never-set';
      },
      { timeout: 2000, timeoutMsg: 'status never became "never-set"' },
    );
  });
});
