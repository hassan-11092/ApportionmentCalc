const puppeteer = require('puppeteer');
const { expect } = require('chai');
const path = require('path');
const fs = require('fs');
const os = require('os');

describe('Import Robustness', function () {
  this.timeout(30000);

  let browser;
  let page;
  let tmpFiles = [];

  before(async () => {
    browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    const filePath = path.resolve(__dirname, '../ApportionmentCalc.html');
    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });

    // Handle unexpected alerts
    page.on('dialog', async dialog => {
        console.log('Dialog caught:', dialog.message());
        await dialog.dismiss();
    });
  });

  after(async () => {
    if (browser) await browser.close();
    tmpFiles.forEach(f => {
        if (fs.existsSync(f)) fs.unlinkSync(f);
    });
  });

  const createCsv = (content, ext = '.csv') => {
      const filePath = path.join(os.tmpdir(), `test_${Math.random().toString(36).substring(7)}${ext}`);
      fs.writeFileSync(filePath, content);
      tmpFiles.push(filePath);
      return filePath;
  };

  const importFile = async (filePath) => {
      await page.waitForSelector('#import', { visible: true });
      const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.click('#import'),
      ]);
      await fileChooser.accept([filePath]);
      // Wait for UI update - naive wait
      await new Promise(r => setTimeout(r, 500));
  };

  const getParties = async () => {
      return await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('.party-row'));
        return rows.map(row => ({
          name: row.querySelector('input[type="text"]').value,
          votes: row.querySelector('input[type="number"]').value
        }));
      });
  };

  it('should handle headerless CSV (A Party,1234)', async () => {
      const csv = createCsv('A Party,1234\nB Party, 567');
      await importFile(csv);
      const parties = await getParties();

      const partyA = parties.find(p => p.name === 'A Party');
      const partyB = parties.find(p => p.name.trim() === 'B Party');

      expect(partyA).to.exist;
      expect(partyA.votes).to.equal('1234');

      expect(partyB).to.exist;
      expect(partyB.votes).to.equal('567');
  });

  it('should handle TSV with Indonesian headers', async () => {
      const tsv = createCsv('partai\tsuara\nPartai C\t8901\nPartai D\t234', '.tsv');
      await importFile(tsv);
      const parties = await getParties();

      const partyC = parties.find(p => p.name === 'Partai C');
      expect(partyC).to.exist;
      expect(partyC.votes).to.equal('8901');
  });

  it('should be compatible with Exported CSV', async () => {
      // Setup data
      await page.reload();
      // Wait for page load
      await page.waitForSelector('#list');

      // Setup download
      const client = await page.target().createCDPSession();
      const downloadPath = fs.mkdtempSync(path.join(os.tmpdir(), 'download-'));
      tmpFiles.push(downloadPath); // Mark dir for cleanup (though recursive delete needed)

      await client.send('Page.setDownloadBehavior', {
          behavior: 'allow',
          downloadPath: downloadPath
      });

      await page.click('#calculate');
      await page.click('#export');

      // Wait for file
      await new Promise(r => setTimeout(r, 2000));

      const files = fs.readdirSync(downloadPath);
      const latest = files.find(f => f.endsWith('.csv'));
      expect(latest).to.exist;

      const exportedPath = path.join(downloadPath, latest);

      // Import back
      await page.reload();
      await importFile(exportedPath);

      const parties = await getParties();
      // Check for default data
      const apple = parties.find(p => p.name === 'Apple Party');
      expect(apple).to.exist;
      expect(apple.votes).to.equal('25000');

      // Clean up download dir
      fs.rmSync(downloadPath, { recursive: true, force: true });
  });
});
