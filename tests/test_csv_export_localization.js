const puppeteer = require('puppeteer');
const { expect } = require('chai');
const path = require('path');

describe('ApportionmentCalc CSV Export Localization', function () {
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

  it('should generate localized CSV headers and values when language is Indonesian', async () => {
    const clearAndType = async (selector, value) => {
        const element = await page.$(selector);
        await element.click({ clickCount: 3 });
        await element.press('Backspace');
        await element.type(value);
    };

    // Set language to Indonesian
    await page.select('#language', 'id');

    // Set seats to 10
    await clearAndType('#seats', '10');

    // Remove all default parties
    const partyCount = (await page.$$('.party-row')).length;
    for (let i = 0; i < partyCount; i++) {
        await page.click('.party-row:nth-child(1) .danger');
    }

    // Add 1 party
    await page.click('#addParty');
    await page.waitForSelector('.party-row:nth-child(1)');

    // Party A: 1000 votes (Passed)
    await page.type('.party-row:nth-child(1) input[type="text"]', 'Partai A');
    await clearAndType('.party-row:nth-child(1) input[type="number"]', '1000');

    await page.click('#calculate');
    await page.waitForSelector('#results:not(.hidden)');

    // Hook into URL.createObjectURL
    await page.evaluate(() => {
        window.blobContent = null;
        const originalCreate = URL.createObjectURL;
        URL.createObjectURL = (blob) => {
            const reader = new FileReader();
            reader.onload = () => {
                window.blobContent = reader.result;
            };
            reader.readAsText(blob);
            return originalCreate(blob);
        };
    });

    await page.click('#export');

    // Wait for blobContent
    await page.waitForFunction(() => window.blobContent !== null);

    const csvContent = await page.evaluate(() => window.blobContent);
    const lines = csvContent.trim().split('\n');
    const header = lines[0];
    const dataRow = lines[1];

    console.log('CSV Header:', header);
    console.log('CSV Data:', dataRow);

    // Assertions for Indonesian Localization
    // Headers
    expect(header).to.include('Partai', 'Header should contain "Partai"');
    expect(header).to.include('Suara', 'Header should contain "Suara"');
    expect(header).to.include('Persentase (%)', 'Header should contain "Persentase (%)"');
    expect(header).to.include('Lolos Ambang Batas?', 'Header should contain "Lolos Ambang Batas?"');
    expect(header).to.include('Kursi Hare', 'Header should contain "Kursi Hare"');
    expect(header).to.include('Kursi Sainte-Laguë', 'Header should contain "Kursi Sainte-Laguë"');
    expect(header).to.include('Selisih', 'Header should contain "Selisih"');

    // Values
    expect(dataRow).to.include('Ya', 'Data row should contain "Ya" instead of "Yes"');
  });
});
