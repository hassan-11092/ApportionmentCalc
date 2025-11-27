import random
import math

def calculate_hare(party_votes, total_valid_votes, total_seats):
    """
    Calculates seat allocation using Hare Quota (Largest Remainder).
    party_votes: list of integers (votes per party)
    total_valid_votes: integer (sum of all valid votes, including eliminated ones if any)
    total_seats: integer
    Returns: list of integers (seats per party, corresponding to input order)
    """
    if total_valid_votes == 0:
        return [0] * len(party_votes)

    quota = total_valid_votes / total_seats

    seats = []
    remainders = []

    for i, votes in enumerate(party_votes):
        allocated = math.floor(votes / quota)
        rem = votes - (allocated * quota)
        seats.append(allocated)
        remainders.append((rem, i))

    allocated_seats = sum(seats)

    # It is possible that allocated_seats < total_seats (likely)
    # It is also possible (though rarer with standard Hare) that allocated_seats > total_seats if we used a weird quota,
    # but here quota = Total / Seats, so sum(votes) / quota = Seats.
    # sum(floor(votes/quota)) <= sum(votes/quota) = Seats.
    # So we usually have remaining seats.

    remaining_seats = total_seats - allocated_seats

    # Sort by remainder descending
    remainders.sort(key=lambda x: x[0], reverse=True)

    for i in range(remaining_seats):
        if i < len(remainders):
            idx = remainders[i][1]
            seats[idx] += 1

    return seats

def calculate_sainte_lague(party_votes, total_seats):
    """
    Calculates seat allocation using Sainte-Laguë (Divisor Method).
    party_votes: list of integers
    total_seats: integer
    Returns: list of integers
    """
    seats = [0] * len(party_votes)

    for _ in range(total_seats):
        max_quotient = -1
        winner_idx = -1

        for i, votes in enumerate(party_votes):
            divisor = 2 * seats[i] + 1
            quotient = votes / divisor

            # Simple tie-breaking: lower index wins (arbitrary but consistent)
            if quotient > max_quotient:
                max_quotient = quotient
                winner_idx = i

        if winner_idx != -1:
            seats[winner_idx] += 1

    return seats

def run_simulation():
    # Simulation Parameters
    party_counts = range(3, 16) # 3 to 15 parties
    seat_counts = [10, 50, 100, 250, 560] # Various parliament sizes
    thresholds = [0, 3, 4, 5] # 0%, 3%, 4%, and 5%
    vote_distributions = ['uniform', 'exponential', 'power-law']

    simulations_per_config = 500

    total_scenarios = 0
    # Analysis buckets
    favorability_counts = {
        'small': {'hare': 0, 'sl': 0, 'neutral': 0},
        'medium': {'hare': 0, 'sl': 0, 'neutral': 0},
        'large': {'hare': 0, 'sl': 0, 'neutral': 0}
    }
    total_scenarios = 0

    header = f"{'Parties':<8} | {'Seats':<6} | {'Thresh%':<7} | {'Dist':<11} | {'Category':<9} | {'Hare Seats':<10} | {'SL Seats':<10} | {'Diff':<10}"
    print(header)
    print("-" * len(header))

    for num_parties in party_counts:
        for num_seats in seat_counts:
            for threshold_pct in thresholds:
                for dist_type in vote_distributions:

                    # Accumulators for this specific configuration
                    totals = {
                        'small': {'hare': 0, 'sl': 0},
                        'medium': {'hare': 0, 'sl': 0},
                        'large': {'hare': 0, 'sl': 0}
                    }

                    for _ in range(simulations_per_config):
                        # 1. Generate Votes
                        votes = []
                        if dist_type == 'uniform':
                            votes = [random.randint(1000, 100000) for _ in range(num_parties)]
                        elif dist_type == 'exponential':
                            votes = [int(random.expovariate(1/10000)) + 100 for _ in range(num_parties)]
                        elif dist_type == 'power-law':
                            votes = [int(random.paretovariate(1.2)) * 1000 for _ in range(num_parties)]

                        total_vote_count = sum(votes)

                        # 2. Apply Threshold
                        threshold_votes = total_vote_count * (threshold_pct / 100.0)
                        passed_indices = [i for i, v in enumerate(votes) if v >= threshold_votes]

                        if len(passed_indices) < 2: continue # Need at least 2 parties to compare

                        passed_votes = [votes[i] for i in passed_indices]

                        # 3. Calculate Allocations
                        # Corrected Hare Logic: Pass total_vote_count as the basis for quota
                        hare_results_passed = calculate_hare(passed_votes, total_vote_count, num_seats)

                        sl_results_passed = calculate_sainte_lague(passed_votes, num_seats)

                        hare_seats_full = [0] * num_parties
                        sl_seats_full = [0] * num_parties
                        for idx, passed_idx in enumerate(passed_indices):
                            hare_seats_full[passed_idx] = hare_results_passed[idx]
                            sl_seats_full[passed_idx] = sl_results_passed[idx]

                        # 4. Analyze Favorability
                        sorted_indices = sorted(range(num_parties), key=lambda k: votes[k])

                        third = num_parties // 3
                        small_indices = sorted_indices[:third]
                        medium_indices = sorted_indices[third:2*third]
                        large_indices = sorted_indices[2*third:]

                        party_categories = {
                            "small": small_indices,
                            "medium": medium_indices,
                            "large": large_indices
                        }

                        for category, indices in party_categories.items():
                            if not indices: continue

                            hare_total = sum(hare_seats_full[i] for i in indices)
                            sl_total = sum(sl_seats_full[i] for i in indices)

                            totals[category]['hare'] += hare_total
                            totals[category]['sl'] += sl_total

                            if hare_total > sl_total:
                                favorability_counts[category]['hare'] += 1
                            elif sl_total > hare_total:
                                favorability_counts[category]['sl'] += 1
                            else:
                                favorability_counts[category]['neutral'] += 1

                        total_scenarios += 1

                    # Print stats for this config
                    for category in ['small', 'medium', 'large']:
                        h_seats = totals[category]['hare']
                        s_seats = totals[category]['sl']
                        diff = h_seats - s_seats
                        print(f"{num_parties:<8} | {num_seats:<6} | {threshold_pct:<7} | {dist_type:<11} | {category:<9} | {h_seats:<10} | {s_seats:<10} | {diff:<10}")

    print("-" * len(header))
    print("Summary:")
    print(f"Total valid scenarios analyzed: {total_scenarios}")

    for category in ['small', 'medium', 'large']:
        cat_total = sum(favorability_counts[category].values())
        if cat_total == 0: continue

        hare_perc = (favorability_counts[category]['hare'] / cat_total) * 100
        sl_perc = (favorability_counts[category]['sl'] / cat_total) * 100
        neutral_perc = (favorability_counts[category]['neutral'] / cat_total) * 100

        print(f"\n--- {category.capitalize()} Parties ---")
        print(f"Hare Quota favored: {favorability_counts[category]['hare']} times ({hare_perc:.2f}%)")
        print(f"Sainte-Laguë favored: {favorability_counts[category]['sl']} times ({sl_perc:.2f}%)")
        print(f"Neutral outcome:    {favorability_counts[category]['neutral']} times ({neutral_perc:.2f}%)")

    print("\nCONCLUSION:")
    if favorability_counts['small']['hare'] > favorability_counts['small']['sl']:
        print("- The data SUPPORTS the claim that Hare Quota tends to favor SMALLER parties.")
    else:
        print("- The data DOES NOT support the claim that Hare Quota favors smaller parties.")

    if favorability_counts['large']['sl'] > favorability_counts['large']['hare']:
         print("- The data SUPPORTS the claim that Sainte-Laguë tends to favor LARGER parties.")
    else:
        print("- The data DOES NOT support the claim that Sainte-Laguë favors larger parties.")

if __name__ == "__main__":
    run_simulation()
