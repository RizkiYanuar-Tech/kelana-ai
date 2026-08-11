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

if __name__ == "__main__":
    destinasi = str(input("Destination: "))
    negara = str(input("Country: "))
    hari = int(input("Days: "))
    budget = float(input("Budget: "))
    mata_uang = str(input("Currency: "))
    travel_month = str(input("travel_month: "))

    print_trip_summary(destinasi, negara, hari, budget, mata_uang, travel_month)
