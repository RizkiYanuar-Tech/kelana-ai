from services.trip_services import get_trip_category, calculate_daily_budget, get_transportation_recommendation, get_travel_season, recommended_places

def print_trip_summary(destination, country, days, budget, currency, travel_month):
    print("="*20)
    print("KelanaAI")
    print("="*20)
    print(f"Destination: {destination}")
    print(f"Country: {country}")
    print(f"Days: {days}")
    print(f"Budget: {budget}")
    print(f"Currency: {currency}")
    print(f"Travel Month: {travel_month}")
    return destination, country, days, budget, currency, travel_month

if __name__ == "__main__":
    destinasi = []
    negara = []

    while True:
        user_destinasi = str(input("Destinasi: "))
        if user_destinasi.lower() == 'exit':
            break

        destinasi.append(user_destinasi)

    while True:
        user_country = str(input("Country: "))
        if user_country.lower() == 'exit':
            break

        negara.append(user_country)

    hari = int(input("Days: "))
    budget = float(input("Budget: "))
    mata_uang = str(input("Currency: "))
    travel_month = str(input("travel_month: "))

    trip_summary = print_trip_summary(destinasi, negara, hari, budget, mata_uang, travel_month)
    daily_budget = calculate_daily_budget(budget, hari)
    category = get_trip_category(budget)
    transport = get_transportation_recommendation(category)
    season = get_travel_season(travel_month)

    print(f"daily_budget: {daily_budget} {mata_uang}/day")
    print(f"category: {category}")
    print(f"transport: {transport}")
    print(f"Seasons: {season}")
    print(f"Recommended Places: {recommended_places}")
