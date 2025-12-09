const puppeteer = require('puppeteer');
const { expect } = require('chai');
const path = require('path');

describe('ApportionmentCalc Remainder Decimal Places', function () {
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

  it('should display integer remainders without decimals', async () => {
    const clearAndType = async (selector, value) => {
        const element = await page.$(selector);
        await element.click({ clickCount: 3 });
        await element.press('Backspace');
        await element.type(value);
    };

    // Scenario:
    // Total Votes: 100. Seats: 10.
    // Quota: 10.
    // Party A: 15 votes. Remainder: 5.
    // Party B: 85 votes. Remainder: 5.

    await clearAndType('#seats', '10');
    await clearAndType('#threshold', '0');

    // Remove all default parties
    const partyCount = (await page.$$('.party-row')).length;
    for (let i = 0; i < partyCount; i++) {
        await page.click('.party-row:nth-child(1) .danger');
    }

    // Add 2 parties
    await page.click('#addParty');
    await page.click('#addParty');
    await page.waitForSelector('.party-row:nth-child(2)');

    await page.type('.party-row:nth-child(1) input[type="text"]', 'Party A');
    await clearAndType('.party-row:nth-child(1) input[type="number"]', '15');

    await page.type('.party-row:nth-child(2) input[type="text"]', 'Party B');
    await clearAndType('.party-row:nth-child(2) input[type="number"]', '85');

    await page.click('#calculate');
    await page.waitForSelector('#results:not(.hidden)');

    const hareResults = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#hareResults table tbody tr'));
      return rows.map(row => {
        const columns = row.querySelectorAll('td');
        return {
          party: columns[0].innerText.trim(),
          remainder: columns[3].innerText.trim(),
        };
      });
    });

    const partyA = hareResults.find(p => p.party === 'Party A');

    console.log('Party A Remainder Display:', partyA.remainder);

    // Expectation: "5" (integers should display without decimals according to memory/guidelines)
    expect(partyA.remainder).to.equal('5', 'Remainder should be displayed without decimals if integer');
  });
});
