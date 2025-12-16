const puppeteer = require('puppeteer');
const { expect } = require('chai');
const path = require('path');

describe('ApportionmentCalc Quota Calculation Fix', function () {
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

  it('should calculate quota using total valid votes including eliminated parties', async () => {
    const clearAndType = async (selector, value) => {
        const element = await page.$(selector);
        await element.click({ clickCount: 3 });
        await element.press('Backspace');
        await element.type(value);
    };

    await clearAndType('#seats', '2');
    await clearAndType('#threshold', '9'); // 9% threshold

    // Remove all default parties
    const partyCount = (await page.$$('.party-row')).length;
    for (let i = 0; i < partyCount; i++) {
        await page.click('.party-row:nth-child(1) .danger');
    }

    // Add 3 parties
    for (let i = 0; i < 3; i++) {
        await page.click('#add');
    }
    await page.waitForSelector('.party-row:nth-child(3)');

    // Party A: 20 votes (will be eliminated: 20 / (20+171+56) = 8.09% < 9%)
    await page.type('.party-row:nth-child(1) input[type="text"]', 'Party A');
    await clearAndType('.party-row:nth-child(1) input[type="number"]', '20');

    // Party B: 171 votes
    await page.type('.party-row:nth-child(2) input[type="text"]', 'Party B');
    await clearAndType('.party-row:nth-child(2) input[type="number"]', '171');

    // Party C: 56 votes
    await page.type('.party-row:nth-child(3) input[type="text"]', 'Party C');
    await clearAndType('.party-row:nth-child(3) input[type="number"]', '56');

    await page.click('#calculate');
    await page.waitForSelector('#results:not(.hidden)');

    const hareResults = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#hare table tbody tr'));
      return rows.map(row => {
        const columns = row.querySelectorAll('td');
        return {
          party: columns[0].innerText.trim(),
          seats: columns[2].innerText,
        };
      });
    });

    const partyB = hareResults.find(p => p.party === 'Party B');
    const partyC = hareResults.find(p => p.party === 'Party C');

    // Scenario details:
    // Total Valid Votes (A+B+C) = 20 + 171 + 56 = 247.
    // Seats = 2.
    // Quota (based on total valid votes) = 247 / 2 = 123.5.

    // Allocation:
    // Party B: 171 / 123.5 = 1.38 -> 1 seat. Remainder = 171 - 123.5 = 47.5.
    // Party C: 56 / 123.5 = 0.45 -> 0 seats. Remainder = 56.

    // Remaining seat goes to Party C (56 > 47.5).
    // Final: B=1, C=1.

    console.log('Party B seats:', partyB.seats);
    console.log('Party C seats:', partyC.seats);

    expect(parseInt(partyB.seats, 10)).to.equal(1, 'Party B should have 1 seat');
    expect(parseInt(partyC.seats, 10)).to.equal(1, 'Party C should have 1 seat');
  });
});
