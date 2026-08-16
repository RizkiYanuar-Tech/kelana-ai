def get_trip_category(budget):
    if budget < 1000:
        category="Backpacker"
    elif budget < 3000:
        category="Standard"
    else:
        category="Luxury"
    return category

def get_travel_season(month):
    if month.capitalize() == 'December':
        return 'Peak Season'
    elif month.capitalize() == 'June':
        return 'Holiday Season'
    else:
        return 'Regular Season'

def calculate_daily_budget(budget, days):
    budget_daily =  budget / days
    return budget_daily

def get_transportation_recommendation(category):
    if category == "Backpacker":
        return "Bus"
    elif category == "Standard":
        return "Train"
    else:
        return "Flight"

recommended_places = [
        'Tokyo Tower',
        'Mount Fuji',
        'Shibuya'
    ]
