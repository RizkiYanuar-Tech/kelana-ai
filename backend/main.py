from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .services.trip_service import (
    get_trip_category,
    calculate_daily_budget,
    get_transportation_recommendation,
    get_travel_season,
    recommended_places)
from .models.trip import Trip
from .database import SessionLocal, init_db

class TripUpdateRequest(BaseModel):
    budget: float

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_style: str

app = FastAPI()

init_db()

@app.get("/")
def home():
    """Menampilkan Pesan Selamat Datang di Awal"""
    return {
        "message": "Welcome to KelanaAI"
    }

@app.get("/health")
def check_health():
    """Mengembalikan nilai OK jika server berjalan dengan baik"""
    return {
        "status": "OK"
    }

@app.get("/api/v1/trip-categories")
def trip_categories():
    """Mengambil dan Menampilkan data sebagai daftar kategori perjalanan"""
    return [
        "Backpacker",
        "Standard",
        "Luxury"
    ]

@app.get("/api/v1/recommendations")
def recommendations():
    "Mengambil list data tempat rekomendasi"
    return [
        'Tokyo Tower',
        'Mount Fuji',
        'Shibuya'
    ]

@app.get("/api/v1/transportations")
def transportations():
    """Mengambil list kategori transportasi"""
    return [
        "Bus",
        "Train",
        "Flight"
    ]

@app.get("/api/v1/trips")
def list_trips():
    db = SessionLocal()
    trips = db.query(Trip).all()
    db.close()
    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()

    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    return trip

@app.post('/api/v1/trips')
def create_trip(request: TripRequest):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)

    trip = Trip(
        destination = request.destination,
        days = request.days,
        budget = request.budget,
        category = category,
        daily_budget = daily_budget
    )

    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)
    db.close()

    return trip

@app.delete('/api/v1/trips/{id}')
def delete_trip(id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == id).first()

    if trip is None:
        db.close()
        raise HTTPException(status_code = 404, detail=f"Trip with id {id} not found")
    
    db.delete(trip)
    db.commit()
    db.close()

    return {"message": f"Trip with id {id} berhasil dihapus"}

@app.put('/api/v1/trips/{trip_id}')
def update_trip(trip_id: int, request: TripUpdateRequest):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    trip.budget = request.budget
    trip.category = get_trip_category(request.budget)
    trip.daily_budget = calculate_daily_budget(request.budget, trip.days)

    db.commit()
    db.refresh(trip)
    db.close()

    return trip
# def print_trip_summary(destination, country, days, budget, currency, travel_month):
    # print("="*20)
    # print("KelanaAI")
    # print("="*20)
    # print(f"Destination: {destination}")
    # print(f"Country: {country}")
    # print(f"Days: {days}")
    # print(f"Budget: {budget}")
    # print(f"Currency: {currency}")
    # print(f"Travel Month: {travel_month}")
    # return destination, country, days, budget, currency, travel_month

# if __name__ == "__main__":
    # destinasi = []
    # negara = []

    # while True:
        # user_destinasi = str(input("Destinasi: "))
        # if user_destinasi.lower() == 'exit':
            # break

        # destinasi.append(user_destinasi)

    # while True:
        # user_country = str(input("Country: "))
        # if user_country.lower() == 'exit':
            # break

        # negara.append(user_country)

    # hari = int(input("Days: "))
    # budget = float(input("Budget: "))
    # mata_uang = str(input("Currency: "))
    # travel_month = str(input("travel_month: "))

    # trip_summary = print_trip_summary(destinasi, negara, hari, budget, mata_uang, travel_month)
    # daily_budget = calculate_daily_budget(budget, hari)
    # category = get_trip_category(budget)
    # transport = get_transportation_recommendation(category)
    # season = get_travel_season(travel_month)

    # print(f"daily_budget: {daily_budget} {mata_uang}/day")
    # print(f"category: {category}")
    # print(f"transport: {transport}")
    # print(f"Seasons: {season}")
    # print(f"Recommended Places: {recommended_places}") 
