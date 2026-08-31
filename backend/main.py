from fastapi import FastAPI, HTTPException, APIRouter, Depends
from pydantic import BaseModel
from .services.trip_service import (
    get_trip_category,
    calculate_daily_budget,
    get_transportation_recommendation,
    get_travel_season,
    recommended_places)
from .services.bedrock_service import get_ai_recommendation
from .services.auth_service import register, login, get_current_user
from .models.user import User
from .models.trip import Trip
from .database import SessionLocal, init_db
from fastapi.middleware.cors import CORSMiddleware
import os

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TripUpdateRequest(BaseModel):
    budget: float

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_style: str

app = FastAPI()

init_db()

# Allow Next.js to Communicate with fastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins = os.getenv("FRONTEND_URL", "http://localhost:3000"),
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

@app.get("/api/data")
def read_root():
    return {"message": "Hello from FastAPI backend!"}

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
def list_trips(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    trips = db.query(Trip).filter(Trip.user_id == current_user.id).all()
    db.close()
    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()

    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    if trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: Kamu tidak bisa trips user lain")
    
    return trip

@app.post('/api/v1/trips')
def create_trip(request: TripRequest,
                current_user: User = Depends(get_current_user)):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)

    trip = Trip(
        user_id = current_user.id,
        destination = request.destination,
        days = request.days,
        budget = request.budget,
        category = category,
        daily_budget = daily_budget,
        travel_style = request.travel_style
    )

    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)
    db.close()

    return trip

@app.post('/api/v1/trips/{id}/generate')
def generate_trip_recommendation(id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == id).first()

    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {id} not found")

    ai_recommendation = get_ai_recommendation(
        destination = trip.destination,
        days = trip.days,
        budget = trip.budget,
        travel_style = trip.travel_style
    )

    trip.ai_recommendation = ai_recommendation
    db.commit()
    db.refresh(trip)
    db.close()

    return {
        "trip_id": trip.id,
        "destination": trip.destination,
        'recommendation': trip.ai_recommendation
    }

@app.post('/api/v1/auth/register')
def register_user(request: RegisterRequest):
    """
    Endpoint mendaftarkan user baru dengan memanggil SessionLocal
    """
    # Memanggil koneksi ke database
    db = SessionLocal()

    try:
        new_user = register(
            db=db,
            name=request.name,
            email=request.email,
            password=request.password
        )

        return {
            "message": "Registrasi berhasil dilakukan!",
            "data": {
                "name": new_user.name,
                "email": new_user.email
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Registrasi gagal: {str(e)}")
    finally:
        db.close()

@app.post('/api/v1/auth/login')
def login_user(request: LoginRequest):
    """
    Endpoint untuk login dan mendapatkan JWT TOKEN Access
    """
    db = SessionLocal()

    try:
        access_token = login(db=db, email=request.email, password=request.password)
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.delete('/api/v1/trips/{id}')
def delete_trip(id: int, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == id).first()

    if trip is None:
        db.close()
        raise HTTPException(status_code = 404, detail=f"Trip with id {id} not found")

    if trip.user_id != current_user.id:
        db.close()
        raise HTTPException(status_code=403, detail="Forbidden: Kamu tidak boleh hapus trips orang lain")
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
