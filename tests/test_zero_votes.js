const puppeteer = require('puppeteer');
const { expect } = require('chai');
const path = require('path');

describe('ApportionmentCalc Zero Votes Bug', function () {
  this.timeout(30000);

  let browser;
  let page;

  before(async () => {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    page = await browser.newPage();
    const filePath = path.resolve(__dirname, '../ApportionmentCalc.html');
    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });

    // Handle alert
    page.on('dialog', async dialog => {
        // console.log('Dialog message:', dialog.message());
        await dialog.dismiss();
    });
  });

  after(async () => {
    await browser.close();
  });

  it('should show alert and not calculate if total votes are 0', async () => {
    const clearAndType = async (selector, value) => {
        const element = await page.$(selector);
        await element.click({ clickCount: 3 });
        await element.press('Backspace');
        await element.type(value);
    };

    // Remove all default parties
    const partyCount = (await page.$$('.party-row')).length;
    for (let i = 0; i < partyCount; i++) {
        await page.click('.party-row:nth-child(1) .danger');
    }

    // Add 1 party
    await page.click('#add');
    await page.waitForSelector('.party-row:nth-child(1)');

    // Party A: 0 votes
    await page.type('.party-row:nth-child(1) input[type="text"]', 'Party A');
    await clearAndType('.party-row:nth-child(1) input[type="number"]', '0');

    await page.click('#calculate');

    // Wait a bit for potential JS execution
    await new Promise(r => setTimeout(r, 500));

    const resultsVisible = await page.evaluate(() => {
        return !document.querySelector('#results').classList.contains('hidden');
    });

    expect(resultsVisible).to.be.false;
  });
});
