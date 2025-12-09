const puppeteer = require('puppeteer');
const { expect } = require('chai');
const path = require('path');

describe('ApportionmentCalc Sainte-Laguë Tie Breaking', function () {
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

  // Helper to clear and type in an input
  const clearAndType = async (selector, value) => {
    const element = await page.$(selector);
    await element.click({ clickCount: 3 });
    await element.press('Backspace');
    await element.type(value);
  };

  const setupParties = async (parties) => {
    // Clear existing parties
    const partyCount = (await page.$$('.party-row')).length;
    for (let i = 0; i < partyCount; i++) {
        await page.click('.party-row:nth-child(1) .danger');
    }

    // Add new parties
    for (let i = 0; i < parties.length; i++) {
        await page.click('#add');
    }
    await page.waitForSelector(`.party-row:nth-child(${parties.length})`);

    // Fill data
    for (let i = 0; i < parties.length; i++) {
        const p = parties[i];
        await page.type(`.party-row:nth-child(${i+1}) input[type="text"]`, p.name);
        await clearAndType(`.party-row:nth-child(${i+1}) input[type="number"]`, p.votes.toString());
    }
  };

  const getSainteLagueResults = async () => {
      return await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('#sainteLague table tbody tr'));
        return rows.map(row => {
          const columns = row.querySelectorAll('td');
          return {
            party: columns[0].innerText.trim(),
            seats: parseInt(columns[2].innerText, 10),
          };
        });
      });
  };

  it('should break ties in Sainte-Laguë by total votes regardless of input order', async () => {
    await clearAndType('#seats', '2');
    await clearAndType('#threshold', '0');

    // Case 1: Small (100) then Big (300)
    // Round 1: Big (300) wins. Big seats=1.
    // Round 2: Small (100) vs Big (300/3 = 100).
    // Tie. Big has more total votes (300 > 100). Big should win.
    // Expected Result: Small=0, Big=2.

    await setupParties([
        { name: 'Small', votes: 100 },
        { name: 'Big', votes: 300 }
    ]);
    await page.click('#calculate');
    await page.waitForSelector('#results:not(.hidden)');

    let results = await getSainteLagueResults();
    let small = results.find(p => p.party === 'Small');
    let big = results.find(p => p.party === 'Big');

    expect(small.seats).to.equal(0, 'Small party should have 0 seats');
    expect(big.seats).to.equal(2, 'Big party should have 2 seats');

    // Case 2: Big (300) then Small (100)
    // Should yield same result.

    await page.click('#edit');
    await setupParties([
        { name: 'Big', votes: 300 },
        { name: 'Small', votes: 100 }
    ]);
    await page.click('#calculate');

    results = await getSainteLagueResults();
    small = results.find(p => p.party === 'Small');
    big = results.find(p => p.party === 'Big');

    expect(small.seats).to.equal(0, 'Small party should have 0 seats in reverse order');
    expect(big.seats).to.equal(2, 'Big party should have 2 seats in reverse order');
  });
});
