function add(a: number, b: number) {
  return a + b;
}
function divide(a: number, b: number) {
  if (b === 0) throw new Error('division by zero');
  return a / b;
}

describe('math @unit', () => {
  it('adds two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('handles negative operands', () => {
    expect(add(-1, 1)).toBe(0);
  });

  it('divides evenly', () => {
    expect(divide(10, 2)).toBe(5);
  });

  it('throws on division by zero', () => {
    expect(() => divide(1, 0)).toThrow('division by zero');
  });
});

describe('browser navigation @e2e', () => {
  afterEach(async () => {
    await browser.takeScreenshot();
  });

  it('navigates to example.com and reads the title', async () => {
    await browser.url('https://example.com');
    const title = await browser.getTitle();
    expect(title).toBe('Example Domain');
  });

  it('finds the heading text', async () => {
    await browser.url('https://example.com');
    const heading = await $('h1');
    const text = await heading.getText();
    expect(text).toBe('Example Domain');
  });
});
