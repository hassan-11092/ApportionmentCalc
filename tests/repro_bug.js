const puppeteer = require('puppeteer');
const { expect } = require('chai');
const path = require('path');

describe('ApportionmentCalc Bug Reproduction', function () {
  this.timeout(30000);

  let browser;
  let page;

  before(async () => {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    page = await browser.newPage();
    const filePath = path.resolve(__dirname, '../ApportionmentCalc.html');
    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });
  });

  after(async () => {
    await browser.close();
  });

  it('should calculate correct remainder when votes/quota is slightly less than integer', async () => {
    // Failing case: Seats: 14, Total: 18, Party A: 9, Party B: 9.
    // Quota = 18/14 = 1.2857...
    // Votes/Quota = 7.
    // Bug: floor(6.999...) = 6. Remainder ~ 1.28.
    // Expected: Seats 7, Remainder 0.

    const clearAndType = async (selector, value) => {
        const element = await page.$(selector);
        await element.click({ clickCount: 3 });
        await element.press('Backspace');
        await element.type(value);
    };

    // Set inputs
    await clearAndType('#seats', '14');
    await clearAndType('#threshold', '0'); // Ensure no filtering

    // Remove default parties
    const partyCount = (await page.$$('.party-row')).length;
    for (let i = 0; i < partyCount; i++) {
        await page.click('.party-row:nth-child(1) .danger');
    }

    // Add 2 parties
    await page.click('#add');
    await page.click('#add');

    // Party A
    await page.type('.party-row:nth-child(1) input[type="text"]', 'Party A');
    await clearAndType('.party-row:nth-child(1) input[type="number"]', '9');

    // Party B
    await page.type('.party-row:nth-child(2) input[type="text"]', 'Party B');
    await clearAndType('.party-row:nth-child(2) input[type="number"]', '9');

    await page.click('#calculate');
    await page.waitForSelector('#results:not(.hidden)');

    // Extract results from Hare Table
    const hareResults = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#hare table tbody tr'));
      return rows.map(row => {
        const columns = row.querySelectorAll('td');
        return {
          party: columns[0].innerText.trim(),
          votes: columns[1].innerText.trim(),
          seats: columns[2].innerText.trim(),
          remainder: columns[3].innerText.trim()
        };
      });
    });

    console.log('Hare Results:', hareResults);

    const partyA = hareResults.find(p => p.party === 'Party A');

    // Check seats (should be 7)
    expect(partyA.seats).to.equal('7');

    // Check remainder (should be 0 or very close to 0)
    // Currently due to bug it is likely ~1.29 (Quota is 1.2857...)
    // 1.2857 formatted to 2 decimals is 1.29.
    // If correct, it should be 0.

    // We expect it to be close to 0.
    // The current UI formats to 2 decimal places.
    // "0" or "0.00"

    expect(partyA.remainder).to.be.oneOf(['0', '0.00', '0,00']);
  });
});
