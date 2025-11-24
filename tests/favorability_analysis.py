import random
import math

def calculate_hare(party_votes, total_seats):
    """
    Calculates seat allocation using Hare Quota (Largest Remainder).
    party_votes: list of integers (votes per party)
    total_seats: integer
    Returns: list of integers (seats per party, corresponding to input order)
    """
    total_votes = sum(party_votes)
    if total_votes == 0:
        return [0] * len(party_votes)

    quota = total_votes / total_seats

    seats = []
    remainders = []

    for i, votes in enumerate(party_votes):
        allocated = math.floor(votes / quota)
        rem = votes - (allocated * quota)
        seats.append(allocated)
        remainders.append((rem, i))

    allocated_seats = sum(seats)
    remaining_seats = total_seats - allocated_seats

    # Sort by remainder descending
    remainders.sort(key=lambda x: x[0], reverse=True)

    for i in range(remaining_seats):
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

    # We simulate the iterative process to handle ties and exact logic
    # though for stats, strict tie-breaking might not matter much,
    # we'll use a simple max finding loop.

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
    seat_counts = [10, 20, 50, 100, 560] # Various parliament sizes
    thresholds = [0, 4] # 0% and 4%
    vote_distributions = ['uniform', 'exponential']

    simulations_per_config = 100

    total_scenarios = 0
    hare_favors_small_count = 0
    sl_favors_small_count = 0
    neutral_count = 0

    print(f"{'Parties':<8} | {'Seats':<6} | {'Thresh%':<7} | {'Dist':<11} | {'Hare Small':<10} | {'SL Small':<10} | {'Diff (H-S)':<10}")
    print("-" * 85)

    for num_parties in party_counts:
        for num_seats in seat_counts:
            for threshold_pct in thresholds:
                for dist_type in vote_distributions:

                    local_hare_small_seats = 0
                    local_sl_small_seats = 0

                    for _ in range(simulations_per_config):
                        # 1. Generate Votes
                        votes = []
                        if dist_type == 'uniform':
                            votes = [random.randint(1000, 100000) for _ in range(num_parties)]
                        elif dist_type == 'exponential':
                            # Generates some large parties and many small ones
                            votes = [int(random.expovariate(1/10000)) + 100 for _ in range(num_parties)]

                        total_vote_count = sum(votes)

                        # 2. Apply Threshold
                        threshold_votes = total_vote_count * (threshold_pct / 100.0)

                        # Identify passed parties
                        passed_indices = [i for i, v in enumerate(votes) if v >= threshold_votes]

                        if not passed_indices:
                            continue # No one passed, skip

                        passed_votes = [votes[i] for i in passed_indices]

                        # 3. Calculate Allocations
                        hare_results_passed = calculate_hare(passed_votes, num_seats)
                        sl_results_passed = calculate_sainte_lague(passed_votes, num_seats)

                        # Map back to original indices
                        hare_seats_full = [0] * num_parties
                        sl_seats_full = [0] * num_parties

                        for idx, passed_idx in enumerate(passed_indices):
                            hare_seats_full[passed_idx] = hare_results_passed[idx]
                            sl_seats_full[passed_idx] = sl_results_passed[idx]

                        # 4. Analyze Favorability
                        # Define "Small Parties": Bottom 50% by vote count
                        sorted_indices = sorted(range(num_parties), key=lambda k: votes[k])
                        small_party_indices = sorted_indices[:num_parties // 2]

                        hare_small_total = sum(hare_seats_full[i] for i in small_party_indices)
                        sl_small_total = sum(sl_seats_full[i] for i in small_party_indices)

                        local_hare_small_seats += hare_small_total
                        local_sl_small_seats += sl_small_total

                        if hare_small_total > sl_small_total:
                            hare_favors_small_count += 1
                        elif sl_small_total > hare_small_total:
                            sl_favors_small_count += 1
                        else:
                            neutral_count += 1

                        total_scenarios += 1

                    # Print stats for this config
                    diff = local_hare_small_seats - local_sl_small_seats
                    print(f"{num_parties:<8} | {num_seats:<6} | {threshold_pct:<7} | {dist_type:<11} | {local_hare_small_seats:<10} | {local_sl_small_seats:<10} | {diff:<10}")

    print("-" * 85)
    print("Summary:")
    print(f"Total Scenarios: {total_scenarios}")
    print(f"Hare favored small parties: {hare_favors_small_count} times ({(hare_favors_small_count/total_scenarios)*100:.2f}%)")
    print(f"SL favored small parties:   {sl_favors_small_count} times ({(sl_favors_small_count/total_scenarios)*100:.2f}%)")
    print(f"Same result:                {neutral_count} times ({(neutral_count/total_scenarios)*100:.2f}%)")

    if hare_favors_small_count > sl_favors_small_count:
        print("\nCONCLUSION: The data SUPPORTS the claim that Hare Quota tends to favor smaller parties compared to Sainte-Laguë.")
    else:
        print("\nCONCLUSION: The data DOES NOT support the claim.")

if __name__ == "__main__":
    run_simulation()
