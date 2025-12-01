const puppeteer = require('puppeteer');
const { expect } = require('chai');
const path = require('path');

describe('ApportionmentCalc NaN Seats Bug', function () {
  this.timeout(10000);

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

  it('should alert if seats input is invalid (NaN)', async () => {
    let alertMessage = null;
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.dismiss();
    });

    // Simulate entering an invalid value (clearing input results in "")
    // Using evaluate to force invalid state easily, but also clearing input via typing works
    await page.evaluate(() => {
        const input = document.getElementById('seats');
        input.value = ''; // empty string -> parseInt('') -> NaN
    });

    await page.click('#calculate');

    expect(alertMessage).to.equal('Total seats must be at least 1.');

    // Check if results are NOT shown
    const resultsHidden = await page.evaluate(() => {
        return document.getElementById('results').classList.contains('hidden');
    });

    expect(resultsHidden).to.be.true;
  });
});
