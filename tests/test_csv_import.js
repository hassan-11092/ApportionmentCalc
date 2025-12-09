const puppeteer = require('puppeteer');
const { expect } = require('chai');
const path = require('path');
const fs = require('fs');
const os = require('os');

describe('CSV Import Feature', function () {
  this.timeout(30000);

  let browser;
  let page;
  let csvFilePath;

  before(async () => {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    page = await browser.newPage();
    const filePath = path.resolve(__dirname, '../ApportionmentCalc.html');
    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });

    // Create a temporary CSV file
    csvFilePath = path.join(os.tmpdir(), 'test_import.csv');
    const csvContent = 'Party,Votes\nImported Party A,1000\nImported Party B,2000';
    fs.writeFileSync(csvFilePath, csvContent);
  });

  after(async () => {
    if (browser) await browser.close();
    if (fs.existsSync(csvFilePath)) fs.unlinkSync(csvFilePath);
  });

  it('should import parties from a CSV file', async () => {
    // Check for the import button
    const importBtn = await page.$('#import');
    expect(importBtn).to.not.be.null;

    // Handle file upload
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click('#import'),
    ]);
    await fileChooser.accept([csvFilePath]);

    // Wait for the parties to be rendered (you might need a better wait condition depending on implementation)
    // Since file reading is async, we might need to wait a bit.
    await new Promise(r => setTimeout(r, 1000));

    // Verify the parties are imported
    const parties = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.party-row'));
      return rows.map(row => ({
        name: row.querySelector('input[type="text"]').value,
        votes: row.querySelector('input[type="number"]').value
      }));
    });

    // Check if imported parties exist (we append or replace? usually replace or append.
    // If we replace, we expect only imported ones. If append, we expect imported ones + existing ones.
    // Let's assume for now we append or replace. The requirement didn't specify.
    // But usually imports might replace existing data or prompt.
    // Given the simplicity, let's assume it replaces the list or we can check if *at least* these exist.
    // Actually, looking at export, it exports current state. Import probably should clear and load or append.
    // Let's assume it appends for now, or check for existence.

    const partyA = parties.find(p => p.name === 'Imported Party A');
    const partyB = parties.find(p => p.name === 'Imported Party B');

    expect(partyA).to.not.be.undefined;
    expect(partyA.votes).to.equal('1000');
    expect(partyB).to.not.be.undefined;
    expect(partyB.votes).to.equal('2000');
  });
});
