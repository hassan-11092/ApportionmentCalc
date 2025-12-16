const puppeteer = require('puppeteer');
const { expect } = require('chai');
const path = require('path');

describe('ApportionmentCalc Precision Reproduction', function () {
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

  it('should display distinguishable remainders for high seat counts', async () => {
    const clearAndType = async (selector, value) => {
        const element = await page.$(selector);
        await element.click({ clickCount: 3 });
        await element.press('Backspace');
        await element.type(value);
    };

    // Scenario:
    // Seats: 300.
    // Party A: 300 votes.
    // Party B: 301 votes.
    // Total Votes: 601.
    // Quota: 601 / 300 = 2.00333...

    // Party A: 300 votes.
    // Seats = floor(300 * 300 / 601) = floor(149.75) = 149.
    // Remainder = 300 - 149 * (601/300) = 300 - 298.4966 = 1.50333...
    // Wait, my manual calculation before was for T=301. Now T=601.

    // Let's re-verify the remainders for T=601.
    // Remainder = (V*S % T) / S.
    // Party A (300): (300*300) % 601 = 90000 % 601.
    // 90000 / 601 = 149.75.
    // 149 * 601 = 89549.
    // 90000 - 89549 = 451.
    // Remainder = 451 / 300 = 1.50333.

    // Party B (301): (301*300) % 601 = 90300 % 601.
    // 90300 / 601 = 150.249.
    // 150 * 601 = 90150.
    // 90300 - 90150 = 150.
    // Remainder = 150 / 300 = 0.5.

    // These are distinguishable (1.50 vs 0.50).

    // I need closer remainders.
    // Difference = 1/S = 1/300 = 0.00333.
    // I need two parties where (V1*S % T) and (V2*S % T) differ by 1.

    // (V2-V1)*S = 1 mod T.
    // 300(V2-V1) = 1 mod 601.
    // 300 is approx 601/2.
    // 300*2 = 600 = -1 mod 601.
    // So 300*(-2) = 1 mod 601.
    // -2 = 599.
    // So V2-V1 = 599.
    // Or V1-V2 = 2.

    // Let V1 = 2. V2 = 0? No V must be positive.
    // Let V1 = 2. V2 = 4 (no, V1-V2=2 means V1=V2+2).
    // Let's try V1=300.
    // I want V2 such that V2-V1 = -2. So V2 = 298.

    // Let's verify:
    // Party A: 300 votes. Remainder (prop to) 451.
    // Party C (298 votes):
    // (298*300) % 601 = 89400 % 601.
    // 89400 / 601 = 148.75.
    // 148 * 601 = 88948.
    // 89400 - 88948 = 452.

    // So Party A gives remainder value 451/300.
    // Party C gives remainder value 452/300.
    // Difference = 1/300 = 0.00333.

    // 451/300 = 1.50333.
    // 452/300 = 1.50666.

    // With 2 digits:
    // 1.50333 -> 1.50.
    // 1.50666 -> 1.51.
    // They are distinguishable!

    // Wait, 3 rounds down (<5), 6 rounds up (>=5).
    // So 1.50 vs 1.51. Distinguishable.

    // I need something that rounds to same.
    // e.g. 0.00333 -> 0.00.
    //      0.00000 -> 0.00.

    // I need remainder proportional to 0 and 1 (mod T).
    // Value 0 comes from V such that V*S = 0 mod T.
    // Since T=601 (prime), S=300. V must be 0 or 601.
    // If I have Party D with 601 votes.
    // But total votes must sum up.

    // Let's try simpler T.
    // T = 301. S = 300.
    // V=301 -> Remainder 0.
    // V=300 -> Remainder 1/300 = 0.00333.
    // With 2 digits:
    // 0 -> 0.00
    // 0.00333 -> 0.00
    // INDISTINGUISHABLE.

    // So I need:
    // Party A: 300 votes.
    // Party B: 301 votes.
    // Total Votes: 601.
    // BUT T in formula is Total Votes. So T=601.
    // I can't force T=301 with these votes.

    // I need Total Votes T such that S and T allow close remainders.
    // And I need parties that sum to T.

    // If I just input Party A: 300, Party B: 1. Sum = 301.
    // T = 301. S = 300.
    // Party A (300): Remainder 0.00333.
    // Party B (1): Remainder 1. (Distinguishable).

    // I need another party with remainder 0.
    // Party C: 301 votes? But T will increase.

    // What if I have Party A: 300. Party B: 300. Party C: 1.
    // Total = 601.
    // Party A: 300 -> 451/300 = 1.50333.
    // Party B: 300 -> 1.50333. (Same).

    // I need Party with remainder close to 1.50333 but different.
    // 450/300 or 452/300.
    // 452 came from V=298.

    // So:
    // Party A: 300 votes.
    // Party B: 298 votes.
    // Party C: 3 votes (to make sum 601).
    // Total = 601.

    // Party A (300): Remainder 1.50333 -> 1.50.
    // Party B (298): Remainder 1.50666 -> 1.51.
    // Distinguishable.

    // Is there any pair that is NOT distinguishable?
    // 0.333 vs 0.336 -> 0.33 vs 0.34.
    // 0.330 vs 0.333 -> 0.33 vs 0.33. !!!

    // I need remainder X and X + 0.00333 such that both round to same.
    // e.g. 0.330 and 0.3333.
    // 0.330 rounds to 0.33.
    // 0.3333 rounds to 0.33.

    // So I need remainder fraction part to be close to .330?
    // Remainder = K/300.
    // I want K/300 approx 0.33.
    // K approx 100.
    // 100/300 = 0.33333 -> 0.33.
    // 99/300 = 0.33.
    // 101/300 = 0.33666 -> 0.34.

    // So 99/300 and 100/300.
    // 99/300 = 0.33.
    // 100/300 = 0.3333... -> 0.33.
    // BOTH 0.33.

    // So I need remainder K=99 and K=100 (mod 300 not relevant, purely numerator).
    // I need (V*S % T) to be 99 and 100.
    // With S=300, T=601.
    // I need V1 such that 300*V1 = 99 mod 601.
    // And V2 such that 300*V2 = 100 mod 601.

    // 300 = -301 mod 601? No. 300 = (601-1)/2 approx?
    // 300 * (-2) = -600 = 1 mod 601.
    // Inverse of 300 is -2 = 599.

    // So V1 = 99 * 599 mod 601.
    // 99 * (-2) = -198 = 403.
    // So V1 = 403.

    // V2 = 100 * 599 mod 601.
    // 100 * (-2) = -200 = 401.
    // So V2 = 401.

    // Let's verify:
    // Party 1: 403 votes.
    // (403*300) % 601 = 120900 % 601.
    // 120900 / 601 = 201.16.
    // 201 * 601 = 120801.
    // 120900 - 120801 = 99. Correct.
    // Remainder = 99/300 = 0.33.

    // Party 2: 401 votes.
    // (401*300) % 601 = 120300 % 601.
    // 120300 / 601 = 200.166.
    // 200 * 601 = 120200.
    // 120300 - 120200 = 100. Correct.
    // Remainder = 100/300 = 0.3333.

    // With 2 digits:
    // 0.33 vs 0.33.
    // Indistinguishable!

    // I need Total Votes = 601.
    // Party 1: 403.
    // Party 2: 401.
    // Sum = 804 > 601. Impossible.

    // I need V1 and V2 to sum to <= T.
    // T must be 601?
    // T is sum of votes.
    // If V1=403, V2=401. Sum=804.
    // So T=804.
    // But my modulo arithmetic assumed T=601.

    // I need to pick T first.
    // Let T = 1000. S = 300.
    // Inverse of 300 mod 1000? GCD(300, 1000) = 100. Not coprime.
    // So I can't generate any remainder.
    // (V*300 % 1000) will always be multiple of 100.
    // Possible values: 0, 100, 200... 900.
    // Remainders: 0/300, 100/300, 200/300.
    // 0, 0.333, 0.666.
    // These are far apart.

    // So I need GCD(S, T) to be small, ideally 1.
    // Let T = 901. S = 300. GCD(300, 901).
    // 901 not div by 2, 3 (sum=10), 5.
    // 300 = 2^2 * 3 * 5^2.
    // So GCD is 1.

    // I need V1, V2 sum <= 901.
    // And 300*V1 = 99 mod 901.
    // 300*V2 = 100 mod 901.

    // Inverse of 300 mod 901.
    // 901 = 3 * 300 + 1.
    // 1 = 901 - 3*300.
    // So -3 * 300 = 1 mod 901.
    // Inverse is -3 = 898.

    // V1 = 99 * (-3) = -297 = 604.
    // V2 = 100 * (-3) = -300 = 601.

    // V1 + V2 = 1205 > 901. Too big.

    // But V is mod 901.
    // Maybe smaller V? No unique V in [0, 901).

    // I need smaller T?
    // If T is small, V cannot be large.

    // Let's go back to "consecutive integers" logic.
    // I need (V2-V1)*S = 1 mod T.
    // If S=300.
    // If I pick T=301. S=-1.
    // (V2-V1)*(-1) = 1 => V1-V2 = 1.
    // V1 = V2 + 1.
    // Let V2 = 100. V1 = 101.
    // Sum = 201 <= 301.
    // Party 3 can have 100 votes.

    // Let's verify with T=301, S=300.
    // Party A: 101 votes.
    // (101*300) % 301.
    // 101*(-1) = -101 = 200.
    // Remainder 200/300 = 0.6666.

    // Party B: 100 votes.
    // (100*300) % 301 = -100 = 201.
    // Remainder 201/300 = 0.67.

    // 0.6666 rounds to 0.67.
    // 0.67 rounds to 0.67.
    // INDISTINGUISHABLE.

    // So:
    // Seats = 300.
    // Party A: 101 votes.
    // Party B: 100 votes.
    // Party C: 100 votes.
    // Total = 301.

    // Expected:
    // Party A Remainder: 0.67 (from 200/300 = 0.666...)
    // Party B Remainder: 0.67 (from 201/300 = 0.67)
    // They are different values but display same.

    await clearAndType('#seats', '300');
    await clearAndType('#threshold', '0');

    // Remove all default parties
    const partyCount = (await page.$$('.party-row')).length;
    for (let i = 0; i < partyCount; i++) {
        await page.click('.party-row:nth-child(1) .danger');
    }

    // Add 3 parties
    for (let i = 0; i < 3; i++) {
        await page.click('#add');
    }
    await page.waitForSelector('.party-row:nth-child(3)');

    await page.type('.party-row:nth-child(1) input[type="text"]', 'Party A');
    await clearAndType('.party-row:nth-child(1) input[type="number"]', '101');

    await page.type('.party-row:nth-child(2) input[type="text"]', 'Party B');
    await clearAndType('.party-row:nth-child(2) input[type="number"]', '100');

    await page.type('.party-row:nth-child(3) input[type="text"]', 'Party C');
    await clearAndType('.party-row:nth-child(3) input[type="number"]', '100');

    await page.click('#calculate');
    await page.waitForSelector('#results:not(.hidden)');

    const hareResults = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#hare table tbody tr'));
      return rows.map(row => {
        const columns = row.querySelectorAll('td');
        return {
          party: columns[0].innerText.trim(),
          votes: columns[1].innerText.trim(),
          seats: columns[2].innerText.trim(),
          remainder: columns[3].innerText.trim(),
        };
      });
    });

    const partyA = hareResults.find(p => p.party === 'Party A');
    const partyB = hareResults.find(p => p.party === 'Party B');

    console.log('Party A Remainder Display:', partyA.remainder);
    console.log('Party B Remainder Display:', partyB.remainder);

    expect(partyA.remainder).to.not.equal(partyB.remainder, 'Remainders should be displayed differently');
  });
});
