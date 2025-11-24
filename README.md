# ApportionmentCalc
Electoral math, simplified.

## Introduction
ApportionmentCalc is a single-file, browser-based calculator for comparing two popular electoral seat allocation methods: **Sainte Laguë** and **Hare Quota**. Designed for students, researchers, election observers, and anyone curious about proportional representation, this tool visualizes how different methods can produce different outcomes from the same vote counts.

The interface is in **Bahasa Indonesia**, making it particularly useful for Indonesian civic education and election analysis.

## How It Works
The calculator takes vote counts for multiple political parties and a total number of seats to allocate, then:

1. **Hare Quota Method**: Calculates the BPP (Bilangan Pembagi Pemilih / Electoral Quota), allocates seats based on full quotas, then distributes remaining seats to parties with the largest remainders.

2. **Sainte Laguë Method**: Uses a divisor sequence (1, 3, 5, 7, 9...) to iteratively allocate seats based on the highest quotient at each step.

3. **Comparison View**: Shows side-by-side results and highlights differences between the two methods.

## Quick Start
1. Download `ApportionmentCalc.html`.
2. Open it in any modern browser (Chrome, Edge, Firefox, Safari).
3. Enter the total number of seats available.
4. Add political parties with their vote counts (or use the default example).
5. Click "Hitung Perolehan Kursi" (Calculate Seat Allocation).
6. Compare the results between both methods.

## Key Features
- **Dual-method comparison**: See Hare Quota and Sainte Laguë results side-by-side
- **Dynamic party input**: Add or remove as many parties as needed
- **Detailed breakdown**: View BPP, remainders, quotients, and step-by-step allocation
- **Difference highlighting**: Quickly spot which parties gain or lose seats under different methods
- **Single HTML file**: No installation, no dependencies, works completely offline
- **Responsive design**: Works on desktop, tablet, and mobile devices

## Use Cases
- **Civic education**: Teaching students about proportional representation
- **Election analysis**: Comparing actual results with alternative methods
- **Research**: Studying the mathematical properties of allocation formulas
- **Policy discussion**: Evaluating electoral system reforms
- **Academic projects**: Demonstrating fairness and proportionality concepts

## Understanding the Methods

### Hare Quota (Kuota Hare)
- Calculates a quota: Total Votes ÷ Total Seats = BPP
- Each party gets one seat for each full quota
- Remaining seats go to parties with the largest remainders
- Tends to favor smaller parties

### Sainte Laguë
- Uses odd-number divisors: 1, 3, 5, 7, 9...
- Seats allocated one-by-one to the party with the highest quotient
- Formula: Votes ÷ (2 × Current Seats + 1)
- Generally considered more proportional for mid-sized parties

## Interpreting Results
- **Kursi (Seats)**: Number of seats allocated to each party
- **Sisa (Remainder)**: Leftover votes after full quota allocation (Hare method)
- **Selisih (Difference)**: Shows +/- seat differences between methods
- Green numbers indicate gains with Sainte Laguë; red indicates losses

## Known Limitations
- Does not account for electoral thresholds (minimum vote percentage requirements)
- Does not handle regional/district-level allocation
- No support for modified Sainte Laguë (using 1.4 as first divisor)
- Interface currently only in Bahasa Indonesia

## Possible Enhancements
Contributions welcome for:
- Multi-language support (English, etc.)
- Additional methods (D'Hondt, Largest Remainder variants)
- Electoral threshold configuration
- Multi-district calculations
- Export to CSV/PDF
- Step-by-step visualization for Sainte Laguë allocation

## Privacy & Data
All calculations happen locally in your browser. No data is sent to any server. The tool is completely offline once loaded.

## License
MIT License. See LICENSE for details.

## Acknowledgments
- Inspired by the need for transparent electoral education in Indonesia
- Mathematical formulas based on standard electoral system literature
- Design influenced by modern web app aesthetics

## Contributions
Contributions, issues, and suggestions are welcome. Please open an issue to discuss ideas or submit a PR.

## Further Reading
- [Proportional Representation on Wikipedia](https://en.wikipedia.org/wiki/Proportional_representation)
- [Sainte-Laguë method](https://en.wikipedia.org/wiki/Sainte-Lagu%C3%AB_method)
- [Hare Quota](https://en.wikipedia.org/wiki/Hare_quota)
- [Indonesia's Electoral System (KPU)](https://www.kpu.go.id/)
