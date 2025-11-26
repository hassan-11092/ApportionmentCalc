const puppeteer = require('puppeteer');
const { expect } = require('chai');
const path = require('path');

describe('ApportionmentCalc', function () {
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

  it('should handle tie-breaking in Hare Quota correctly', async () => {
    // Helper to clear and type in an input
    const clearAndType = async (selector, value) => {
        const element = await page.$(selector);
        await element.click({ clickCount: 3 });
        await element.press('Backspace');
        await element.type(value);
    };

    await clearAndType('#seats', '2');

    // Remove all default parties
    const partyCount = (await page.$$('.party-row')).length;
    for (let i = 0; i < partyCount; i++) {
        await page.click('.party-row:nth-child(1) .danger');
    }

    // Add 3 new parties
    for (let i = 0; i < 3; i++) {
        await page.click('#addParty');
    }
    await page.waitForSelector('.party-row:nth-child(3)');

    // Fill party data
    await page.type('.party-row:nth-child(1) input[type="text"]', 'Party A');
    await clearAndType('.party-row:nth-child(1) input[type="number"]', '7000');

    await page.type('.party-row:nth-child(2) input[type="text"]', 'Party B');
    await clearAndType('.party-row:nth-child(2) input[type="number"]', '2000');

    await page.type('.party-row:nth-child(3) input[type="text"]', 'Party C');
    await clearAndType('.party-row:nth-child(3) input[type="number"]', '1000');

    await page.click('#calculate');
    await page.waitForSelector('#results:not(.hidden)');

    const hareResults = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#hareResults table tbody tr'));
      return rows.map(row => {
        const columns = row.querySelectorAll('td');
        return {
          party: columns[0].innerText.trim(),
          seats: columns[2].innerText.replace(/,/g, ''),
        };
      });
    });

    const partyA = hareResults.find(p => p.party === 'Party A');
    const partyB = hareResults.find(p => p.party === 'Party B');
    const partyC = hareResults.find(p => p.party === 'Party C');

    expect(parseInt(partyA.seats, 10)).to.equal(2);
    expect(parseInt(partyB.seats, 10)).to.equal(0);
    expect(parseInt(partyC.seats, 10)).to.equal(0);
  });
});
