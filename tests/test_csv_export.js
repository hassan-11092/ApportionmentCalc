const puppeteer = require('puppeteer');
const { expect } = require('chai');
const path = require('path');

describe('ApportionmentCalc CSV Export', function () {
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

  it('should generate valid CSV when language is Indonesian', async () => {
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

    // Party A: 1000 votes
    await page.type('.party-row:nth-child(1) input[type="text"]', 'Party A');
    await clearAndType('.party-row:nth-child(1) input[type="number"]', '1000');

    await page.click('#calculate');
    await page.waitForSelector('#results:not(.hidden)');

    // Hook into URL.createObjectURL to capture the blob content
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

    // Wait for blobContent to be populated
    await page.waitForFunction(() => window.blobContent !== null);

    const csvContent = await page.evaluate(() => window.blobContent);

    const lines = csvContent.trim().split('\n');
    const header = lines[0];
    const dataRow = lines[1];

    // Header has 7 columns
    // Party,Votes,Share (%),Passed Threshold?,Hare Seats,Sainte-Laguë Seats,Difference
    expect(header.split(',').length).to.equal(7);

    // Regex to split by comma, ignoring commas inside quotes
    const splitCSV = (str) => {
        const result = [];
        let current = '';
        let inQuote = false;
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            if (char === '"') {
                inQuote = !inQuote;
                current += char;
            } else if (char === ',' && !inQuote) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    };

    const columns = splitCSV(dataRow);

    // Expected: 7 columns.
    // If share is not quoted and contains comma, this will be > 7 or contain split parts.
    expect(columns.length).to.equal(7, 'CSV should have 7 columns');

    // Verify Share column (index 2) is quoted in the raw string if it contains comma
    // In Indonesian, share for 1000/1000 * 100 = 100,00
    // "100,00"
    const share = columns[2];
    expect(share).to.include(',');
    // And to be properly parsed as one column, it must have been quoted in the original string.

    // The raw string check:
    // "Party A",1000,"100,00",...
    expect(dataRow).to.match(/".*?",\d+,".*?",.*/);
  });
});
