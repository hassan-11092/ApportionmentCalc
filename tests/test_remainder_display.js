const puppeteer = require('puppeteer');
const { expect } = require('chai');
const path = require('path');

describe('ApportionmentCalc Remainder Display Bug', function () {
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

  it('should display distinguishable remainders to avoid confusion', async () => {
    const clearAndType = async (selector, value) => {
        const element = await page.$(selector);
        await element.click({ clickCount: 3 });
        await element.press('Backspace');
        await element.type(value);
    };

    // Scenario:
    // Total Votes: 100. Seats: 3.
    // Party A: 10 votes.
    // Party B: 43 votes.
    // Party C: 47 votes.
    // Quota: 33.333.
    // Remainder A: 10.
    // Remainder B: 9.666.
    // Both round to 10 if fraction digits = 0.

    await clearAndType('#seats', '3');
    await clearAndType('#threshold', '0');

    // Remove all default parties
    const partyCount = (await page.$$('.party-row')).length;
    for (let i = 0; i < partyCount; i++) {
        await page.click('.party-row:nth-child(1) .danger');
    }

    // Add 3 parties
    for (let i = 0; i < 3; i++) {
        await page.click('#addParty');
    }
    await page.waitForSelector('.party-row:nth-child(3)');

    await page.type('.party-row:nth-child(1) input[type="text"]', 'Party A');
    await clearAndType('.party-row:nth-child(1) input[type="number"]', '10');

    await page.type('.party-row:nth-child(2) input[type="text"]', 'Party B');
    await clearAndType('.party-row:nth-child(2) input[type="number"]', '43');

    await page.type('.party-row:nth-child(3) input[type="text"]', 'Party C');
    await clearAndType('.party-row:nth-child(3) input[type="number"]', '47');

    await page.click('#calculate');
    await page.waitForSelector('#results:not(.hidden)');

    const hareResults = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#hareResults table tbody tr'));
      return rows.map(row => {
        const columns = row.querySelectorAll('td');
        return {
          party: columns[0].innerText.trim(),
          votes: columns[1].innerText.trim(),
          seats: columns[2].innerText.trim(),
          remainder: columns[3].innerText.trim(),
        };
      });
    });

    const partyA = hareResults.find(p => p.party === 'Party A');
    const partyB = hareResults.find(p => p.party === 'Party B');

    console.log('Party A Remainder Display:', partyA.remainder);
    console.log('Party B Remainder Display:', partyB.remainder);

    // Before fix: Both likely "10"
    // Expectation: They should be distinguishable (e.g., "10" and "9.67" or similar)
    // Or at least, verify they ARE confusing currently.

    // We want the test to FAIL if they are the same (proving the bug)
    // AND pass if they are different (verifying the fix).
    expect(partyA.remainder).to.not.equal(partyB.remainder, 'Remainders should be displayed differently');
  });
});
