const puppeteer = require('puppeteer');
const { expect } = require('chai');
const path = require('path');

describe('ApportionmentCalc Threshold Precision', function () {
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

  it('should correctly include parties meeting the threshold exactly despite floating point errors', async () => {
    const clearAndType = async (selector, value) => {
        const element = await page.$(selector);
        await element.click({ clickCount: 3 });
        await element.press('Backspace');
        await element.type(value);
    };

    // Set seats to 10
    await clearAndType('#seats', '10');
    // Set threshold to 1.1%
    await clearAndType('#threshold', '1.1');

    // Remove all default parties
    const partyCount = (await page.$$('.party-row')).length;
    for (let i = 0; i < partyCount; i++) {
        await page.click('.party-row:nth-child(1) .danger');
    }

    // Add 2 new parties
    await page.click('#addParty');
    await page.click('#addParty');
    await page.waitForSelector('.party-row:nth-child(2)');

    // Party A: 1100 votes (Exactly 1.1% of 100,000)
    await page.type('.party-row:nth-child(1) input[type="text"]', 'Party A');
    await clearAndType('.party-row:nth-child(1) input[type="number"]', '1100');

    // Party B: 98900 votes (Rest)
    await page.type('.party-row:nth-child(2) input[type="text"]', 'Party B');
    await clearAndType('.party-row:nth-child(2) input[type="number"]', '98900');

    // Total votes should be 100,000.
    // Threshold votes = 100,000 * 1.1 / 100 = 1100.
    // Party A has 1100 votes. Should pass.

    await page.click('#calculate');
    await page.waitForSelector('#results:not(.hidden)');

    // Check if Party A is present in the Hare Results table
    const hareParties = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#hareResults table tbody tr'));
      return rows.map(row => row.querySelector('td').innerText.trim());
    });

    // If the bug exists, Party A will be missing from the results
    expect(hareParties).to.include('Party A');
  });
});
