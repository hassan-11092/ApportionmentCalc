**English** | [Bahasa Indonesia](README-id.md)

# ApportionmentCalc
Electoral math, simplified.

## Introduction
ApportionmentCalc is a single-file, browser-based calculator for comparing two popular electoral seat allocation methods: **Sainte Laguë** and **Hare Quota**. Designed for students, researchers, election observers, and anyone curious about proportional representation, this tool visualizes how different methods can produce different outcomes from the same vote counts.

The interface supports both **English** and **Bahasa Indonesia**.

## How It Works
The calculator takes vote counts for multiple political parties and a total number of seats to allocate, then:

1. **Electoral Threshold**: Filters out parties that do not meet the minimum vote percentage requirement (if configured).
2. **Hare Quota Method**: Calculates the Electoral Quota, allocates seats based on full quotas, then distributes remaining seats to parties with the largest remainders.
3. **Sainte Laguë Method**: Uses a divisor sequence (1, 3, 5, 7, 9...) to iteratively allocate seats based on the highest quotient at each step.
4. **Comparison View**: Shows side-by-side results and highlights differences between the two methods.

## Quick Start
1. Download `ApportionmentCalc.html`.
2. Open it in any modern browser (Chrome, Edge, Firefox, Safari).
3. Enter the total number of seats available.
4. Set the electoral threshold (e.g., 4%).
5. Add political parties with their vote counts.
6. Click "Calculate Allocation".
7. Compare the results, view step-by-step visualizations, or export data to CSV.

## Key Features
- **Multi-language Support**: Toggle between English and Indonesian.
- **Dark/Light Theme**: Automatic or manual theme selection.
- **Electoral Threshold**: Configurable percentage to filter parties.
- **Dual-method comparison**: See Hare Quota and Sainte Laguë results side-by-side.
- **Dynamic party input**: Add or remove as many parties as needed.
- **Detailed breakdown**: View Quota, remainders, quotients, and detailed allocation steps.
- **Visualizations**: Step-by-step table showing how each seat is awarded in the Sainte-Laguë method.
- **CSV Export**: Download results for further analysis.
- **Single HTML file**: No installation, no dependencies, works completely offline.
- **Responsive design**: Works on desktop, tablet, and mobile devices.

## Use Cases
- **Civic education**: Teaching students about proportional representation.
- **Election analysis**: Comparing actual results with alternative methods.
- **Research**: Studying the mathematical properties of allocation formulas.
- **Policy discussion**: Evaluating electoral system reforms.

## Understanding the Methods

### Hare Quota
- Calculates a quota: Total Valid Votes ÷ Total Seats = Quota
- Each party gets one seat for each full quota
- Remaining seats go to parties with the largest remainders
- Tends to favor smaller parties

### Sainte Laguë
- Uses odd-number divisors: 1, 3, 5, 7, 9...
- Seats allocated one-by-one to the party with the highest quotient
- Formula: Votes ÷ (2 × Current Seats + 1)
- Tends to favor larger parties

## Favorability Analysis
A statistical simulation of ~380,000 electoral scenarios confirmed the bias tendencies of each method:

- **Small Parties**: Hare Quota provided a more favorable outcome in **5.53%** of cases, compared to 3.85% for Sainte-Laguë.
- **Large Parties**: Sainte-Laguë provided a more favorable outcome in **38.16%** of cases, compared to 3.80% for Hare Quota.

This data supports the general consensus that Hare Quota is friendlier to smaller parties, while Sainte-Laguë significantly benefits larger parties.

## Privacy & Data
All calculations happen locally in your browser. No data is sent to any server. The tool is completely offline once loaded.

## License
MIT License. See LICENSE for details.

## Contributions
Contributions, issues, and suggestions are welcome. Please open an issue to discuss ideas or submit a PR.
